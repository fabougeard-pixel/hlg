import PDFDocument from 'pdfkit';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Format currency according to Portuguese locale (pt-PT)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
};

// Format date in European Portuguese (pt-PT)
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date);
};

const formatPaymentMethod = (method: string) => {
  switch (method?.toUpperCase()) {
    case 'BANK_TRANSFER':
      return 'Transferência Bancária';
    case 'STRIPE':
      return 'Cartão de Crédito / Débito';
    case 'PAYPAL':
      return 'PayPal';
    case 'MBWAY':
      return 'MB WAY';
    case 'MULTIBANCO':
      return 'Multibanco';
    default:
      return method || 'N/A';
  }
};

export async function generateInvoicePDF(order: any): Promise<Buffer> {
  let logoBuffer: Buffer | null = null;
  let storeName = 'HLG Hausgeräte';
  let companyName = 'HLG Hausgeräte GmbH';
  let companyAddress = 'Borseler Chaussee 123, 22453 Hamburg, Deutschland';
  let companyEmail = 'info@hlg-hausgeraete.de';
  
  try {
    const settingsDb = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'HEADER_LOGO_IMAGE',
            'STYLE2_LOGO',
            'STORE_NAME',
            'NEXT_PUBLIC_STORE_NAME',
            'CONTACT_ADDRESS',
            'FOOTER_ADDRESS_1',
            'CONTACT_EMAIL_DISPLAY',
            'FOOTER_SUPPORT_EMAIL'
          ]
        }
      }
    });
    const sMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    
    if (sMap.STORE_NAME) storeName = sMap.STORE_NAME;
    else if (sMap.NEXT_PUBLIC_STORE_NAME) storeName = sMap.NEXT_PUBLIC_STORE_NAME;

    if (sMap.CONTACT_ADDRESS) companyAddress = sMap.CONTACT_ADDRESS;
    else if (sMap.FOOTER_ADDRESS_1) companyAddress = sMap.FOOTER_ADDRESS_1;

    if (sMap.CONTACT_EMAIL_DISPLAY) companyEmail = sMap.CONTACT_EMAIL_DISPLAY;
    else if (sMap.FOOTER_SUPPORT_EMAIL) companyEmail = sMap.FOOTER_SUPPORT_EMAIL;

    // Remote logo attempt
    const logoSetting = sMap['HEADER_LOGO_IMAGE'] || sMap['STYLE2_LOGO'];
    if (logoSetting && /^https?:\/\//i.test(logoSetting)) {
      try {
        const res = await fetch(logoSetting);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          logoBuffer = Buffer.from(ab);
        }
      } catch (err) {
        console.warn('Failed to fetch remote logo for PDF invoice:', err);
      }
    }
  } catch (e) {
    // ignore
  }

  // Robust local logo fallback (public/logo.png is the primary high-res logo)
  if (!logoBuffer) {
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(process.cwd(), 'public', 'logo-flame.png'),
      path.join(process.cwd(), 'public', 'logo.jpg')
    ];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          logoBuffer = fs.readFileSync(p);
          break;
        }
      } catch {}
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Customer details extraction
      let customerName = 'Consumidor Final';
      let customerEmail = order.user?.email || '';
      let customerPhone = '';
      let customerNif = '';
      let customerAddress = '';
      let shippingCost = 0;
      let shippingMethodName = '';

      if (order.destinationAddress) {
        try {
          const metadata = typeof order.destinationAddress === 'string'
            ? JSON.parse(order.destinationAddress)
            : order.destinationAddress;

          const billing = metadata?.billing || metadata?.shipping;
          if (billing) {
            customerName = `${billing.firstName || ''} ${billing.lastName || ''}`.trim() || customerName;
            customerEmail = billing.email || customerEmail;
            customerPhone = billing.phone || '';
            customerNif = billing.nif || billing.taxId || metadata?.nif || '';
            const street = [billing.address1, billing.address2, billing.address].filter(Boolean).join(', ');
            const cityPostal = [billing.postalCode, billing.zipCode, billing.city].filter(Boolean).join(' ');
            customerAddress = [street, cityPostal, billing.country].filter(Boolean).join('\n').trim();
          }

          if (typeof metadata?.shippingCost === 'number') {
            shippingCost = metadata.shippingCost;
          }
          if (metadata?.shippingMethodName) {
            shippingMethodName = metadata.shippingMethodName;
          }
        } catch (e) {
          // ignore
        }
      }

      // Render document parts
      generateHeader(doc, logoBuffer, storeName, companyName, companyAddress, companyEmail);
      generateCustomerInformation(
        doc,
        order,
        customerName,
        customerEmail,
        customerPhone,
        customerNif,
        customerAddress
      );
      generateInvoiceTable(doc, order, shippingCost, shippingMethodName);
      generateFooter(doc, companyEmail);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function generateHeader(
  doc: typeof PDFDocument,
  logoBuffer: Buffer | null,
  storeName: string,
  companyName: string,
  companyAddress: string,
  companyEmail: string
) {
  const headerTop = 45;

  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 50, headerTop, { width: 140, height: 45, fit: [140, 45] });
    } catch (e) {
      doc
        .fillColor('#ea580c')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(storeName, 50, headerTop + 10);
    }
  } else {
    doc
      .fillColor('#ea580c')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(storeName, 50, headerTop + 10);
  }

  doc
    .fillColor('#1e293b')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('FATURA', 200, headerTop, { align: 'right' })
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#334155')
    .text(companyName, 200, headerTop + 26, { align: 'right' })
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#64748b')
    .text(companyAddress, 200, headerTop + 38, { align: 'right' })
    .text(`E-mail: ${companyEmail} | www.lenhaecarvaosilvadias.com`, 200, headerTop + 50, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(
  doc: typeof PDFDocument,
  order: any,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerNif: string,
  customerAddress: string
) {
  doc
    .fillColor('#1e293b')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Dados da Encomenda & Faturação', 50, 130);

  generateHr(doc, 148);

  const customerInformationTop = 160;

  // Left Column: Order details
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#64748b')
    .text('Fatura N.º:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text(`SD-${order.id.slice(-6).toUpperCase()}`, 150, customerInformationTop)

    .font('Helvetica')
    .fillColor('#64748b')
    .text('Data de Emissão:', 50, customerInformationTop + 15)
    .font('Helvetica')
    .fillColor('#1e293b')
    .text(formatDate(new Date(order.createdAt)), 150, customerInformationTop + 15)

    .font('Helvetica')
    .fillColor('#64748b')
    .text('Método de Pagamento:', 50, customerInformationTop + 30)
    .font('Helvetica-Bold')
    .fillColor('#ea580c')
    .text(formatPaymentMethod(order.paymentMethod), 150, customerInformationTop + 30)

    .font('Helvetica')
    .fillColor('#64748b')
    .text('Estado da Encomenda:', 50, customerInformationTop + 45)
    .font('Helvetica')
    .fillColor('#1e293b')
    .text(order.status === 'PAID' ? 'Pago' : order.status === 'SHIPPED' ? 'Expedido' : order.status === 'PROCESSING' ? 'Em Processamento' : 'Pendente', 150, customerInformationTop + 45);

  // Right Column: Client details
  doc
    .font('Helvetica-Bold')
    .fillColor('#64748b')
    .fontSize(9)
    .text('Faturado a:', 320, customerInformationTop)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .fontSize(10)
    .text(customerName, 320, customerInformationTop + 13)
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#334155');

  let currentY = customerInformationTop + 27;

  if (customerNif) {
    doc.text(`NIF: ${customerNif}`, 320, currentY);
    currentY += 13;
  } else {
    doc.text('NIF: Consumidor Final', 320, currentY);
    currentY += 13;
  }

  if (customerEmail) {
    doc.text(`E-mail: ${customerEmail}`, 320, currentY);
    currentY += 13;
  }

  if (customerPhone) {
    doc.text(`Telefone: ${customerPhone}`, 320, currentY);
    currentY += 13;
  }

  if (customerAddress) {
    doc.text(customerAddress.replace(/\n/g, ', '), 320, currentY, { width: 230 });
  }

  generateHr(doc, 240);
}

function generateInvoiceTable(
  doc: typeof PDFDocument,
  order: any,
  shippingCost: number,
  shippingMethodName: string
) {
  const invoiceTableTop = 265;

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#1e293b');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Artigo / Descrição',
    'Qtd.',
    'Preço Unit.',
    'Total'
  );
  generateHr(doc, invoiceTableTop + 18);
  doc.font('Helvetica').fontSize(9).fillColor('#334155');

  let position = invoiceTableTop + 26;
  
  if (order.orderItems && order.orderItems.length > 0) {
    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      const title = item.product?.title || 'Artigo';
      const quantity = item.quantity;
      const price = item.price;
      const lineTotal = quantity * price;

      generateTableRow(
        doc,
        position,
        title.length > 48 ? title.substring(0, 48) + '...' : title,
        quantity.toString(),
        formatPrice(price),
        formatPrice(lineTotal)
      );

      generateHr(doc, position + 18);
      position += 26;
    }
  }

  // Calculate totals & tax
  const subTotal = order.orderItems?.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0) || order.total;
  const shippingLabel = shippingCost === 0
    ? `Gratuito${shippingMethodName ? ` (${shippingMethodName})` : ''}`
    : formatPrice(shippingCost);

  // Approximate IVA portion for informational breakdown (23% legal standard)
  const ivaRate = 0.23;
  const baseLiquida = order.total / (1 + ivaRate);
  const valorIva = order.total - baseLiquida;

  let totalsY = position + 15;

  doc.font('Helvetica').fontSize(9).fillColor('#64748b');
  doc.text('Subtotal:', 340, totalsY, { width: 100, align: 'right' });
  doc.font('Helvetica').fillColor('#1e293b').text(formatPrice(subTotal), 450, totalsY, { width: 100, align: 'right' });

  totalsY += 16;
  doc.font('Helvetica').fillColor('#64748b').text('Portes de Envio:', 340, totalsY, { width: 100, align: 'right' });
  doc.font('Helvetica').fillColor('#1e293b').text(shippingLabel, 450, totalsY, { width: 100, align: 'right' });

  totalsY += 16;
  doc.font('Helvetica').fillColor('#64748b').text('IVA (Incluído ~23%):', 340, totalsY, { width: 100, align: 'right' });
  doc.font('Helvetica').fillColor('#1e293b').text(formatPrice(valorIva), 450, totalsY, { width: 100, align: 'right' });

  totalsY += 20;
  generateHr(doc, totalsY - 4);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ea580c');
  doc.text('Total da Fatura:', 320, totalsY, { width: 120, align: 'right' });
  doc.text(formatPrice(order.total), 450, totalsY, { width: 100, align: 'right' });
  doc.font('Helvetica');
}

function generateFooter(doc: typeof PDFDocument, companyEmail: string) {
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text(
      'Agradecemos a sua preferência e confiança!',
      50,
      695,
      { align: 'center', width: 500 }
    )
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#64748b')
    .text(
      `Para qualquer esclarecimento, apoio ao cliente ou questão técnica, contacte-nos através do e-mail ${companyEmail}.`,
      50,
      710,
      { align: 'center', width: 500 }
    )
    .text(
      'Documento de conferência de encomenda emitido por computador em conformidade com as normas aplicáveis.',
      50,
      722,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(
  doc: typeof PDFDocument,
  y: number,
  item: string,
  quantity: string,
  unitCost: string,
  lineTotal: string
) {
  doc
    .text(item, 50, y, { width: 280 })
    .text(quantity, 335, y, { width: 45, align: 'right' })
    .text(unitCost, 385, y, { width: 75, align: 'right' })
    .text(lineTotal, 465, y, { width: 85, align: 'right' });
}

function generateHr(doc: typeof PDFDocument, y: number) {
  doc
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
