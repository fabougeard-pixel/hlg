import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// HTML escape utility to prevent XSS in email templates
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fetch SMTP settings and store branding from DB
async function getTransporter() {
  const settingsDb = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'SMTP_HOST',
          'SMTP_PORT',
          'SMTP_USER',
          'SMTP_PASS',
          'SMTP_FROM',
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

  const settings = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  if (!settings.SMTP_HOST || !settings.SMTP_USER || !settings.SMTP_PASS) {
    throw new Error('Configuração SMTP não encontrada na base de dados.');
  }

  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: parseInt(settings.SMTP_PORT || '587', 10),
    secure: settings.SMTP_PORT === '465',
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });

  const storeName = settings.STORE_NAME || settings.NEXT_PUBLIC_STORE_NAME || process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";
  const storeEmail = settings.CONTACT_EMAIL_DISPLAY || settings.FOOTER_SUPPORT_EMAIL || 'info@hlg-hausgeraete.de';
  const storeAddress = settings.CONTACT_ADDRESS || settings.FOOTER_ADDRESS_1 || 'Borseler Chaussee 123, 22453 Hamburg, Deutschland';
  const logo = settings.HEADER_LOGO_IMAGE || settings.STYLE2_LOGO || '';

  return {
    transporter,
    from: settings.SMTP_FROM || `"${storeName}" <${settings.SMTP_USER || 'info@lenhaecarvaosilvadias.com'}>`,
    logo,
    storeName,
    storeEmail,
    storeAddress
  };
}

// General email sender
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  replyTo?: string;
}) {
  try {
    const { transporter, from } = await getTransporter();
    
    const info = await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      html,
      attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
    return { success: false, error };
  }
}

// FORMATTER HELPERS — Strictly European Portuguese (pt-PT)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date);
};

const formatPaymentMethodPT = (method: string) => {
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

// --- EMAIL TEMPLATES (100% PORTUGUÊS DE PORTUGAL) ---

// 1. Client Order Confirmation (Com fatura anexada)
export async function sendClientOrderConfirmation(order: any, userEmail: string, userName: string) {
  try {
    const { logo, storeName, storeEmail, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeEmail: 'info@hlg-hausgeraete.de',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 25px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 48px; object-contain: contain;"></div>`
      : `<div style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 25px;">${escapeHtml(storeName)}</div>`;

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata = typeof order.destinationAddress === 'string' ? JSON.parse(order.destinationAddress) : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal = metadata?.subTotal || order.orderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.total;
    const shippingCostStr = metadata?.shippingCost === 0
      ? "Gratuito!"
      : (metadata?.shippingCost ? formatPrice(metadata.shippingCost) : "0,00 €");
    const shippingMethod = metadata?.shippingMethodName ? `(${metadata.shippingMethodName})` : "";
    
    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName = escapeHtml(`${b.firstName || ''} ${b.lastName || ''}`.trim() || userName || 'Estimado(a) Cliente');
    const shippingName = escapeHtml(`${s.firstName || ''} ${s.lastName || ''}`.trim()) || billingName;
    const billingAddressHtml = `${escapeHtml(b.address1 || '')}<br/>${escapeHtml(b.postalCode || '')} ${escapeHtml(b.city || '')}${b.country ? `, ${escapeHtml(b.country)}` : ''}`;
    const shippingAddressHtml = `${escapeHtml(s.address1 || '')}<br/>${escapeHtml(s.postalCode || '')} ${escapeHtml(s.city || '')}${s.country ? `, ${escapeHtml(s.country)}` : ''}`;
    
    const paymentMethodStr = formatPaymentMethodPT(order.paymentMethod);
    const orderId = order.id.slice(-6).toUpperCase();

    const itemsHtml = order.orderItems?.map((item: any) => {
      let imageUrl = '';
      if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        imageUrl = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
      } else if (typeof item.product?.images === 'string') {
        try {
          const imgs = JSON.parse(item.product.images);
          if (imgs.length > 0) imageUrl = imgs[0];
        } catch(e) {}
      }

      const safeImageUrl = imageUrl && /^https?:\/\//i.test(imageUrl) ? escapeHtml(imageUrl) : '';
      const imgTag = safeImageUrl
        ? `<img src="${safeImageUrl}" alt="${escapeHtml(item.product?.title || 'Artigo')}" style="width: 52px; height: 52px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; margin-right: 15px;" />`
        : '';
      
      const sku = item.product?.gtin || item.product?.sku ? `<span style="font-size: 11px; color: #888;">Ref: #${escapeHtml(item.product.gtin || item.product.sku)}</span>` : '';

      return `
        <tr style="border-bottom: 1px dashed #e5e7eb;">
          <td style="padding: 14px 0;">
            <table style="width: 100%; border: none;">
              <tr>
                ${imgTag ? `<td style="width: 65px; vertical-align: middle;">${imgTag}</td>` : ''}
                <td style="vertical-align: middle;">
                  <strong style="font-size: 13px; color: #1e293b;">${escapeHtml(item.product?.title || 'Artigo')}</strong><br/>
                  ${sku}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 14px 0; text-align: center; vertical-align: middle; color: #64748b; font-size: 13px;">×${item.quantity}</td>
          <td style="padding: 14px 0; text-align: right; vertical-align: middle; color: #1e293b; font-weight: 600; font-size: 13px;">${formatPrice(item.price)}</td>
        </tr>
      `;
    }).join('') || '';

    // Bank Details logic for Portuguese customers
    let bankDetailsHtml = '';
    if (order.paymentMethod === 'BANK_TRANSFER') {
      const dbSettings = await prisma.setting.findMany({
        where: { key: { in: ['BANK_TRANSFER_ACCOUNT_HOLDER', 'BANK_TRANSFER_IBAN', 'BANK_TRANSFER_BIC', 'BANK_TRANSFER_BANK_NAME', 'BANK_TRANSFER_INSTRUCTIONS'] } }
      });
      const settings = dbSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
      
      bankDetailsHtml = `
        <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin-top: 25px; margin-bottom: 25px;">
          <h4 style="margin-top: 0; margin-bottom: 12px; color: #c2410c; font-size: 15px; font-weight: bold;">
            💳 Dados para Transferência Bancária
          </h4>
          <p style="font-size: 13px; color: #431407; margin-bottom: 15px; line-height: 1.5;">
            Por favor, efetue a transferência do valor total para a conta abaixo indicada. É indispensável colocar o número da encomenda <strong>#${orderId}</strong> como descritivo/referência da transferência.
          </p>
          <table style="width: 100%; font-size: 13px; color: #1e293b; line-height: 1.8;">
            ${settings.BANK_TRANSFER_ACCOUNT_HOLDER ? `<tr><td style="width: 140px; color: #7c2d12;">Titular da Conta:</td><td><strong>${escapeHtml(settings.BANK_TRANSFER_ACCOUNT_HOLDER)}</strong></td></tr>` : ''}
            ${settings.BANK_TRANSFER_IBAN ? `<tr><td style="color: #7c2d12;">IBAN:</td><td><strong style="letter-spacing: 1px; font-family: monospace;">${escapeHtml(settings.BANK_TRANSFER_IBAN)}</strong></td></tr>` : ''}
            ${settings.BANK_TRANSFER_BIC ? `<tr><td style="color: #7c2d12;">BIC / SWIFT:</td><td><strong>${escapeHtml(settings.BANK_TRANSFER_BIC)}</strong></td></tr>` : ''}
            ${settings.BANK_TRANSFER_BANK_NAME ? `<tr><td style="color: #7c2d12;">Banco:</td><td><strong>${escapeHtml(settings.BANK_TRANSFER_BANK_NAME)}</strong></td></tr>` : ''}
          </table>
          <p style="font-size: 12px; color: #9a3412; margin-top: 15px; margin-bottom: 0;">
            Após a realização da transferência, a sua encomenda será preparada e expedida de imediato.
          </p>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 10px;">
          Obrigado pela sua encomenda, ${escapeHtml(userName) || 'Estimado(a) Cliente'}!
        </h1>
        <p style="font-size: 14px; color: #475569; margin-top: 0;">
          Confirmamos com satisfação a receção da sua encomenda <strong>#${orderId}</strong> realizada a ${formatDate(new Date(order.createdAt))}. A sua fatura oficial encontra-se em anexo em formato PDF.
        </p>
        
        <h3 style="font-size: 15px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
          Resumo da Encomenda #${orderId}
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead style="text-align: left; border-bottom: 1px solid #e2e8f0;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Artigo</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Qtd.</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 6px; padding: 15px;">
          <table style="width: 100%; font-size: 13px; color: #475569; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right; color: #0f172a;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Portes de Envio: ${shippingMethod}</td>
              <td style="text-align: right; color: #0f172a;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #ea580c; font-size: 16px; border-top: 1px solid #e2e8f0;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #64748b;">Método de Pagamento:</td>
              <td style="text-align: right; font-size: 12px; color: #0f172a;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        ${bankDetailsHtml}

        <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; padding-bottom: 20px;">
          <table style="width: 100%; font-size: 12px; color: #334155; line-height: 1.5;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Morada de Faturação</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(b.phone)}</span><br/>` : ''}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Morada de Entrega</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(s.phone)}</span>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 30px; font-size: 13px; color: #475569;">
          <p style="margin-bottom: 8px;">Agradecemos novamente a sua preferência e confiança na nossa equipa!</p>
          <p style="margin-top: 0;">Se necessitar de assistência ou tiver alguma questão sobre a sua entrega, não hesite em contactar-nos através de <a href="mailto:${storeEmail}" style="color: #ea580c; font-weight: bold; text-decoration: none;">${storeEmail}</a>.</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}<br/>
          E-mail: ${storeEmail} | <a href="https://lenhaecarvaosilvadias.com" style="color: #94a3b8; text-decoration: none;">lenhaecarvaosilvadias.com</a>
        </div>
      </div>
    `;

    const { generateInvoicePDF } = await import('./pdfGenerator');
    let pdfAttachment: any = null;
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      pdfAttachment = {
        filename: `fatura-${orderId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      };
    } catch (pdfErr) {
      console.error('Falha ao gerar o PDF da fatura:', pdfErr);
    }

    return sendEmail({
      to: userEmail,
      subject: `Confirmação de Encomenda #${orderId} - ${storeName}`,
      html,
      attachments: pdfAttachment ? [pdfAttachment] : []
    });
  } catch (e) {
    console.error(e);
  }
}

// 2. Admin New Order Notification
export async function sendAdminOrderNotification(order: any, adminEmail: string, customerDetails: any) {
  try {
    const { logo, storeName } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 40px;"></div>`
      : `<div style="font-size: 18px; font-weight: bold; color: #ea580c; margin-bottom: 20px;">${escapeHtml(storeName)}</div>`;

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata = typeof order.destinationAddress === 'string' ? JSON.parse(order.destinationAddress) : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal = metadata?.subTotal || order.orderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.total;
    const shippingCostStr = metadata?.shippingCost === 0
      ? "Gratuito!"
      : (metadata?.shippingCost ? formatPrice(metadata.shippingCost) : "0,00 €");
    const shippingMethod = metadata?.shippingMethodName ? `(${metadata.shippingMethodName})` : "";
    
    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName = escapeHtml(`${b.firstName || ''} ${b.lastName || ''}`.trim() || customerDetails?.name || 'Cliente');
    const shippingName = escapeHtml(`${s.firstName || ''} ${s.lastName || ''}`.trim()) || billingName;
    const billingAddressHtml = `${escapeHtml(b.address1 || '')}<br/>${escapeHtml(b.postalCode || '')} ${escapeHtml(b.city || '')}${b.country ? `, ${escapeHtml(b.country)}` : ''}`;
    const shippingAddressHtml = `${escapeHtml(s.address1 || '')}<br/>${escapeHtml(s.postalCode || '')} ${escapeHtml(s.city || '')}${s.country ? `, ${escapeHtml(s.country)}` : ''}`;
    
    const paymentMethodStr = formatPaymentMethodPT(order.paymentMethod);
    const orderId = order.id.slice(-6).toUpperCase();

    const itemsHtml = order.orderItems?.map((item: any) => {
      let imageUrl = '';
      if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        imageUrl = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
      } else if (typeof item.product?.images === 'string') {
        try {
          const imgs = JSON.parse(item.product.images);
          if (imgs.length > 0) imageUrl = imgs[0];
        } catch(e) {}
      }

      const safeImageUrl = imageUrl && /^https?:\/\//i.test(imageUrl) ? escapeHtml(imageUrl) : '';
      const imgTag = safeImageUrl
        ? `<img src="${safeImageUrl}" alt="${escapeHtml(item.product?.title || 'Artigo')}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 4px; margin-right: 12px; border: 1px solid #eee;" />`
        : '';
      
      const sku = item.product?.gtin || item.product?.sku ? `(#${escapeHtml(item.product.gtin || item.product.sku)})` : '';

      return `
        <tr style="border-bottom: 1px dashed #e2e8f0;">
          <td style="padding: 12px 0;">
            <table style="width: 100%; border: none;">
              <tr>
                ${imgTag ? `<td style="width: 60px; vertical-align: middle;">${imgTag}</td>` : ''}
                <td style="vertical-align: middle;">
                  <strong style="font-size: 13px; color: #1e293b;">${escapeHtml(item.product?.title || 'Artigo')}</strong><br/>
                  <span style="font-size: 11px; color: #64748b;">${sku}</span>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 12px 0; text-align: center; vertical-align: middle; color: #64748b; font-size: 13px;">×${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right; vertical-align: middle; color: #1e293b; font-weight: 600; font-size: 13px;">${formatPrice(item.price)}</td>
        </tr>
      `;
    }).join('') || '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 10px;">
          🎉 Nova Encomenda Recebida: N.º ${orderId}
        </h1>
        <p style="font-size: 14px; color: #475569;">
          Recebeu uma nova encomenda efetuada por <strong>${billingName}</strong> a ${formatDate(new Date(order.createdAt))}.
        </p>
        
        <h3 style="font-size: 15px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
          Resumo da Encomenda #${orderId}
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead style="text-align: left; border-bottom: 1px solid #e2e8f0;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Artigo</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Qtd.</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 6px; padding: 15px;">
          <table style="width: 100%; font-size: 13px; color: #475569; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right; color: #0f172a;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Portes de Envio: ${shippingMethod}</td>
              <td style="text-align: right; color: #0f172a;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #ea580c; font-size: 16px; border-top: 1px solid #e2e8f0;">
              <td><strong>Total da Venda:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #64748b;">Método de Pagamento:</td>
              <td style="text-align: right; font-size: 12px; color: #0f172a; font-weight: bold;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; padding-bottom: 20px;">
          <table style="width: 100%; font-size: 12px; color: #334155; line-height: 1.5;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Dados de Faturação</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(b.phone)}</span><br/>` : ''}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Dados de Entrega</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(s.phone)}</span>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 25px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lenhaecarvaosilvadias.com'}/admin/orders/${order.id}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
            Ver e Gerir Encomenda no Painel Admin
          </a>
        </div>
      </div>
    `;

    const customerEmail = customerDetails?.email || b.email || order.user?.email;
    const customerFullName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || customerDetails?.name;
    const replyTo = customerEmail
      ? (customerFullName ? `"${customerFullName}" <${customerEmail}>` : customerEmail)
      : undefined;

    return sendEmail({
      to: adminEmail,
      replyTo,
      subject: `🚨 [Nova Encomenda] #${orderId} - ${formatPrice(order.total)} (${billingName})`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 3. Client Order Status Update (Expedida / Entregue / Cancelada / Em Processamento)
export async function sendOrderStatusUpdate(order: any, userEmail: string, status: string) {
  try {
    const { logo, storeName, storeEmail, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeEmail: 'info@hlg-hausgeraete.de',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 25px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 48px;"></div>`
      : `<div style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 25px;">${escapeHtml(storeName)}</div>`;

    const orderId = order.id.slice(-6).toUpperCase();
    let title = "A sua encomenda foi atualizada";
    let message = `O estado da sua encomenda <strong>#${orderId}</strong> foi atualizado.`;
    let color = "#1e293b";
    let subject = `Atualização da sua encomenda #${orderId} - ${storeName}`;

    if (status === 'SHIPPED') {
      title = "A sua encomenda está a caminho! 🚚";
      message = `Temos o prazer de informar que a sua encomenda <strong>#${orderId}</strong> foi expedida com sucesso e encontra-se em trânsito para a morada de entrega indicada.`;
      color = "#16a34a";
      subject = `A sua encomenda #${orderId} foi expedida! 🚚 - ${storeName}`;
    } else if (status === 'CANCELLED') {
      title = "Informação sobre a sua encomenda";
      message = `Informamos que a sua encomenda <strong>#${orderId}</strong> foi cancelada. Caso já tenha sido efetuado o pagamento, o respetivo reembolso encontra-se em processamento.`;
      color = "#dc2626";
      subject = `Cancelamento da sua encomenda #${orderId} - ${storeName}`;
    } else if (status === 'DELIVERED') {
      title = "A sua encomenda foi entregue com sucesso! 📦";
      message = `A sua encomenda <strong>#${orderId}</strong> foi marcada como entregue. Esperamos que desfrute dos seus artigos com a máxima satisfação e conforto!`;
      color = "#16a34a";
      subject = `A sua encomenda #${orderId} foi entregue! 📦 - ${storeName}`;
    } else if (status === 'PROCESSING') {
      title = "A sua encomenda está a ser preparada ⚙️";
      message = `A sua encomenda <strong>#${orderId}</strong> encontra-se em processamento e a ser cuidadosamente preparada pela nossa equipa técnica.`;
      color = "#ea580c";
      subject = `A sua encomenda #${orderId} está em preparação ⚙️ - ${storeName}`;
    }

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata = typeof order.destinationAddress === 'string' ? JSON.parse(order.destinationAddress) : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal = metadata?.subTotal || order.orderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.total;
    const shippingCostStr = metadata?.shippingCost === 0
      ? "Gratuito!"
      : (metadata?.shippingCost ? formatPrice(metadata.shippingCost) : "0,00 €");
    const shippingMethod = metadata?.shippingMethodName ? `(${metadata.shippingMethodName})` : "";
    
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName = escapeHtml(`${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Estimado(a) Cliente');
    const shippingName = escapeHtml(`${s.firstName || ''} ${s.lastName || ''}`.trim()) || billingName;
    const billingAddressHtml = `${escapeHtml(b.address1 || '')}<br/>${escapeHtml(b.postalCode || '')} ${escapeHtml(b.city || '')}${b.country ? `, ${escapeHtml(b.country)}` : ''}`;
    const shippingAddressHtml = `${escapeHtml(s.address1 || '')}<br/>${escapeHtml(s.postalCode || '')} ${escapeHtml(s.city || '')}${s.country ? `, ${escapeHtml(s.country)}` : ''}`;
    const paymentMethodStr = formatPaymentMethodPT(order.paymentMethod);

    let itemsHtml = '';
    if (order.orderItems && order.orderItems.length > 0) {
      itemsHtml = order.orderItems.map((item: any) => {
        let imageUrl = '';
        if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
          imageUrl = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
        } else if (typeof item.product?.images === 'string') {
          try {
            const imgs = JSON.parse(item.product.images);
            if (imgs.length > 0) imageUrl = imgs[0];
          } catch(e) {}
        }
  
        const safeImageUrl = imageUrl && /^https?:\/\//i.test(imageUrl) ? escapeHtml(imageUrl) : '';
        const imgTag = safeImageUrl
          ? `<img src="${safeImageUrl}" alt="Artigo" style="width: 48px; height: 48px; object-fit: contain; border-radius: 4px; margin-right: 12px; border: 1px solid #eee;" />`
          : '';

        return `
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="padding: 12px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  ${imgTag ? `<td style="width: 60px; vertical-align: middle;">${imgTag}</td>` : ''}
                  <td style="vertical-align: middle;">
                    <span style="font-size: 13px; color: #1e293b; font-weight: 600;">${escapeHtml(item.product?.title || 'Artigo')}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 12px 0; text-align: center; vertical-align: middle; color: #64748b; font-size: 13px;">×${item.quantity}</td>
            <td style="padding: 12px 0; text-align: right; vertical-align: middle; color: #1e293b; font-weight: 600; font-size: 13px;">${formatPrice(item.price)}</td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: ${color}; margin-top: 0; margin-bottom: 12px;">${title}</h1>
        <p style="font-size: 14px; color: #475569;">Olá ${billingName},</p>
        <p style="font-size: 14px; color: #475569;">${message}</p>
        
        <h3 style="font-size: 15px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
          Resumo da Encomenda #${orderId}
        </h3>
        
        ${itemsHtml ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead style="text-align: left; border-bottom: 1px solid #e2e8f0;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Artigo</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Qtd.</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ` : ''}
        
        <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 6px; padding: 15px;">
          <table style="width: 100%; font-size: 13px; color: #475569; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right; color: #0f172a;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Portes de Envio: ${shippingMethod}</td>
              <td style="text-align: right; color: #0f172a;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #ea580c; font-size: 16px; border-top: 1px solid #e2e8f0;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #64748b;">Método de Pagamento:</td>
              <td style="text-align: right; font-size: 12px; color: #0f172a;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; padding-bottom: 20px;">
          <table style="width: 100%; font-size: 12px; color: #334155; line-height: 1.5;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Morada de Faturação</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(b.phone)}</span><br/>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                <strong style="font-size: 13px; color: #0f172a;">Morada de Entrega</strong><br/>
                <div style="margin-top: 8px; color: #475569;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #ea580c;">Tel: ${escapeHtml(s.phone)}</span>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 25px; font-size: 13px; color: #475569;">
          <p>Para qualquer esclarecimento adicional, por favor contacte-nos através do e-mail <a href="mailto:${storeEmail}" style="color: #ea580c; text-decoration: none; font-weight: bold;">${storeEmail}</a>.</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}<br/>
          E-mail: ${storeEmail}
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 4. Abandoned Cart Recovery Email (Carrinho Abandonado)
export async function sendAbandonedCartRecoveryEmail(cart: any, userEmail: string, userName: string, checkoutUrl: string) {
  try {
    const { logo, storeName, storeEmail, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeEmail: 'info@hlg-hausgeraete.de',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 25px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 48px;"></div>`
      : `<div style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 25px;">${escapeHtml(storeName)}</div>`;

    const couponMessage = "Utilize o código promocional BH874XP para beneficiar de 25 € de desconto imediato!"; 

    let itemsHtml = '';
    if (Array.isArray(cart.cartData) && cart.cartData.length > 0) {
      const productIds = cart.cartData
        .map((i: any) => i?.productId)
        .filter((id: any): id is string => typeof id === 'string');

      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, isDeleted: false },
        select: { id: true, title: true, price: true, images: true }
      });
      const dbMap = new Map(dbProducts.map(p => [p.id, p]));

      itemsHtml = cart.cartData.map((item: any) => {
        const dbProduct = item?.productId ? dbMap.get(item.productId) : null;
        const title = dbProduct?.title || item?.title || 'Artigo';
        const price = dbProduct?.price ?? (Number(item?.price) || 0);
        const rawImages = dbProduct?.images || item?.product?.images;

        let imageUrl = '';
        if (Array.isArray(rawImages) && rawImages.length > 0) {
          imageUrl = typeof rawImages[0] === 'string' ? rawImages[0] : (rawImages[0]?.url || '');
        } else if (typeof rawImages === 'string') {
          try {
            const parsed = JSON.parse(rawImages);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
          } catch {}
        }
  
        const safeImageUrl = imageUrl && /^https?:\/\//i.test(imageUrl) ? escapeHtml(imageUrl) : '';
        const imgTag = safeImageUrl
          ? `<img src="${safeImageUrl}" alt="Artigo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; margin-right: 15px; border: 1px solid #eee;" />`
          : '';
        const qty = Math.min(Math.max(1, Number(item?.quantity) || 1), 999);
  
        return `
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="padding: 14px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  ${imgTag ? `<td style="width: 65px; vertical-align: middle;">${imgTag}</td>` : ''}
                  <td style="vertical-align: middle;">
                    <strong style="font-size: 13px; color: #1e293b;">${escapeHtml(title)}</strong>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 14px 0; text-align: center; vertical-align: middle; color: #64748b; font-size: 13px;">×${qty}</td>
            <td style="padding: 14px 0; text-align: right; vertical-align: middle; color: #1e293b; font-weight: 600; font-size: 13px;">${formatPrice(price)}</td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
          Os seus artigos ainda estão guardados no seu carrinho! 🔥
        </h1>
        <p style="font-size: 14px; color: #475569;">Olá ${escapeHtml(userName) || 'Estimado(a) Cliente'},</p>
        <p style="font-size: 14px; color: #475569;">
          Reparámos que selecionou produtos na nossa loja online, mas não chegou a finalizar a sua encomenda. Para sua comodidade, guardámos a sua seleção para que possa concluir a compra a qualquer momento.
        </p>
        
        <div style="background-color: #fff7ed; border: 1px dashed #ea580c; border-radius: 8px; padding: 16px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #c2410c;">${couponMessage}</p>
        </div>

        <h3 style="font-size: 15px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
          Artigos no seu Carrinho
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead style="text-align: left; border-bottom: 1px solid #e2e8f0;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Artigo</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Qtd.</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 35px; text-align: center;">
          <a href="${checkoutUrl}" style="background-color: #ea580c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
            Finalizar a Minha Encomenda Agora
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 30px; font-size: 13px; color: #475569;">
          <p>Caso tenha alguma questão sobre produtos ou entregas, não hesite em contactar-nos através de <a href="mailto:${storeEmail}" style="color: #ea580c; font-weight: bold; text-decoration: none;">${storeEmail}</a>.</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Os seus artigos ainda estão guardados no seu carrinho! 🔥 - ${storeName}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 5. Review Request Email (Pedido de Avaliação de Produto)
export async function sendReviewRequestEmail(order: any, userEmail: string, userName: string, storeUrl: string) {
  try {
    const { logo, storeName, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 25px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 48px;"></div>`
      : `<div style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 25px;">${escapeHtml(storeName)}</div>`;

    const orderId = order.id.slice(-6).toUpperCase();

    let itemsHtml = '';
    if (order.orderItems && order.orderItems.length > 0) {
      itemsHtml = order.orderItems.map((item: any) => {
        let imageUrl = '';
        if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
          imageUrl = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
        } else if (typeof item.product?.images === 'string') {
          try {
            const imgs = JSON.parse(item.product.images);
            if (imgs.length > 0) imageUrl = imgs[0];
          } catch(e) {}
        }
  
        const imgTag = imageUrl
          ? `<img src="${imageUrl}" alt="Artigo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; margin-right: 15px; border: 1px solid #eee;" />`
          : '';
  
        return `
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="padding: 14px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  ${imgTag ? `<td style="width: 65px; vertical-align: middle;">${imgTag}</td>` : ''}
                  <td style="vertical-align: middle;">
                    <strong style="font-size: 13px; color: #1e293b;">${escapeHtml(item.product?.title || 'Artigo')}</strong>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 14px 0; text-align: right; vertical-align: middle;">
              <a href="${storeUrl}/produkt/${item.product?.slug || item.product?.id}" style="background-color: #107b46; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block;">
                Bewerten
              </a>
            </td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
          Como correu a sua experiência?
        </h1>
        <p style="font-size: 14px; color: #475569;">Olá ${escapeHtml(userName) || 'Estimado(a) Cliente'},</p>
        <p style="font-size: 14px; color: #475569;">
          Esperamos que esteja a desfrutar dos artigos da sua recente encomenda na <strong>${escapeHtml(storeName)}</strong>!
        </p>
        <p style="font-size: 14px; color: #475569;">
          A sua opinião é muito valiosa para nós e ajuda outros clientes a escolherem as melhores soluções de aquecimento para as suas casas.
        </p>
        
        <h3 style="font-size: 15px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
          Partilhe a sua Avaliação
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 30px; font-size: 13px; color: #475569;">
          <p>Agradecemos sinceramente a sua disponibilidade para partilhar a sua experiência connosco.</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Como foi a sua experiência? Avalie a sua encomenda #${orderId} - ${storeName}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 6. Admin Low Stock Alert (Alerta de Stock Crítico)
export async function sendLowStockAlertEmail(
  productTitle: string,
  variationName: string | null,
  currentStock: number,
  threshold: number,
  adminEmail: string,
  storeUrl: string,
  productId: string
) {
  try {
    const { logo, storeName, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 40px;"></div>`
      : `<div style="font-size: 18px; font-weight: bold; color: #ea580c; margin-bottom: 20px;">${escapeHtml(storeName)}</div>`;

    const productName = variationName ? `${productTitle} (${variationName})` : productTitle;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #dc2626; margin-top: 0; margin-bottom: 12px;">⚠️ Alerta: Nível de Stock Crítico</h1>
        <p style="font-size: 14px; color: #475569;">Atenção Administrador,</p>
        <p style="font-size: 14px; color: #475569;">O stock do artigo indicado desceu abaixo do limite de alerta configurado (${threshold} unidades).</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 15px;">${escapeHtml(productName)}</h3>
          <p style="margin-bottom: 0; font-size: 15px; color: #1e293b;">
            <strong>Stock Restante: <span style="color: #dc2626; font-size: 18px;">${currentStock}</span> unidade(s)</strong>
          </p>
        </div>
        
        <p style="margin-top: 30px; text-align: center; margin-bottom: 30px;">
          <a href="${storeUrl}/admin/products/${productId}/edit" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
            Atualizar Stock no Painel
          </a>
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}
        </div>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `⚠️ [Alerta de Stock Baixo] ${productName} - Apenas ${currentStock} unidade(s) restantes`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 7. Admin New Chat Message Notification (Mensagem no Chat de Apoio)
export async function sendAdminNewChatMessageEmail(
  guestName: string,
  guestEmail: string | null,
  messageContent: string,
  adminEmail: string,
  storeUrl: string
) {
  try {
    const { logo, storeName, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 40px;"></div>`
      : `<div style="font-size: 18px; font-weight: bold; color: #ea580c; margin-bottom: 20px;">${escapeHtml(storeName)}</div>`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">💬 Nova Mensagem de Apoio ao Cliente</h1>
        <p style="font-size: 14px; color: #475569;">Um visitante deixou uma mensagem através do chat online da sua loja.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <tr>
            <td style="padding: 12px; font-size: 13px; font-weight: bold; width: 100px; color: #64748b;">De:</td>
            <td style="padding: 12px; font-size: 13px; color: #0f172a;">
              <strong>${escapeHtml(guestName) || "Visitante"}</strong>
              ${guestEmail ? ` &lt;<a href="mailto:${guestEmail}" style="color: #2563eb;">${escapeHtml(guestEmail)}</a>&gt;` : ""}
            </td>
          </tr>
          <tr style="border-top: 1px solid #e2e8f0;">
            <td style="padding: 12px; vertical-align: top; font-size: 13px; font-weight: bold; color: #64748b;">Mensagem:</td>
            <td style="padding: 12px; font-size: 13px; color: #1e293b; font-style: italic; line-height: 1.5;">
              "${escapeHtml(messageContent)}"
            </td>
          </tr>
        </table>
        
        <p style="margin-top: 30px; text-align: center; margin-bottom: 30px;">
          <a href="${storeUrl}/admin/chat" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
            Responder no Chat do Administrador
          </a>
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}
        </div>
      </div>
    `;

    const replyTo = guestEmail
      ? (guestName ? `"${guestName}" <${guestEmail}>` : guestEmail)
      : undefined;

    return sendEmail({
      to: adminEmail,
      replyTo,
      subject: `💬 [Chat Apoio] Nova mensagem de ${escapeHtml(guestName) || "Visitante"}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 8. Newsletter Welcome Email for Client (Boas-vindas Newsletter com Voucher de 25 €)
export async function sendNewsletterWelcomeEmail(userEmail: string) {
  try {
    const { logo, storeName, storeEmail, storeAddress } = await getTransporter().catch(() => ({
      logo: '',
      storeName: 'HLG Hausgeräte',
      storeEmail: 'info@hlg-hausgeraete.de',
      storeAddress: 'Borseler Chaussee 123, 22453 Hamburg'
    }));
    
    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 25px;"><img src="${logo}" alt="${escapeHtml(storeName)}" style="max-height: 48px;"></div>`
      : `<div style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 25px;">${escapeHtml(storeName)}</div>`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 25px; background: #ffffff;">
        ${logoHtml}
        <h1 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
          🎁 Bem-vindo(a)! Receba 25 € de desconto na sua próxima compra
        </h1>
        
        <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
          É com imensa satisfação que lhe damos as boas-vindas à nossa newsletter! 🌿
        </p>
        <p style="font-size: 14px; color: #475569; margin-bottom: 25px;">
          Como presente de boas-vindas, oferecemos-lhe <strong>25 € de desconto imediato</strong> para utilizar na sua próxima encomenda de pellets, lenha, salamandras ou climatização!
        </p>
        
        <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 22px; text-align: center; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 13px; color: #c2410c; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
            O seu código promocional exclusivo:
          </p>
          <p style="margin: 10px 0 0 0; font-size: 26px; font-weight: 800; color: #ea580c; letter-spacing: 3px; font-family: monospace;">
            🏷️ BH874XP
          </p>
        </div>
        
        <p style="font-size: 13px; color: #64748b; margin-bottom: 25px; text-align: center;">
          Insira o código no checkout da sua encomenda — sem valor mínimo de compra! 🛒
        </p>
        
        <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 12px; color: #0f172a; border-bottom: 2px solid #107b46; padding-bottom: 6px;">
          Ihre exklusiven HLG Hausgeräte Vorteile:
        </h3>
        <ul style="font-size: 13px; color: #475569; padding-left: 20px; margin-bottom: 25px; line-height: 1.8;">
          <li>✨ Exklusive Rabatte und Frühzugang zu Sonderangeboten</li>
          <li>⚡ 2 Jahre Garantie auf alle Großgeräte</li>
          <li>📦 Kostenloser und versicherter Versand direkt nach Hause</li>
        </ul>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://hlg-hausgeraete.de/shop" style="background-color: #107b46; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
            Produkte im Shop ansehen
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 25px; font-size: 13px; color: #475569;">
          <p style="font-weight: bold; color: #107b46; margin-bottom: 4px;">HLG Hausgeräte Kundenservice</p>
          <p style="margin-top: 0; font-size: 12px; color: #64748b;">Kontakt: ${storeEmail}</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <strong style="color: #64748b;">${escapeHtml(storeName)}</strong><br/>
          ${escapeHtml(storeAddress)}
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Willkommen bei HLG Hausgeräte! Ihr 25 € Gutschein 🎁`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 9. Supervision Live Admin Alert Email
export async function sendAdminAlertEmail({
  title,
  message,
  details,
}: {
  title: string;
  message: string;
  details?: Record<string, any>;
}) {
  try {
    const settingsDb = await prisma.setting.findMany({
      where: { key: { in: ['CONTACT_RECEIVER_EMAIL', 'SMTP_USER'] } }
    });
    const sMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    const recipient = sMap['CONTACT_RECEIVER_EMAIL'] || sMap['SMTP_USER'] || 'cabeliminizenda@gmail.com';

    let detailsHtml = '';
    if (details && Object.keys(details).length > 0) {
      detailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-top: 15px;">
          <table style="width: 100%; font-size: 13px; color: #334155;">
            ${Object.entries(details).map(([k, v]) => `
              <tr>
                <td style="padding: 4px 8px; font-weight: bold; width: 140px; vertical-align: top;">${escapeHtml(k)}:</td>
                <td style="padding: 4px 8px; font-family: monospace;">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : String(v))}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <div style="background-color: #ef4444; color: white; padding: 12px 20px; border-radius: 6px 6px 0 0; font-size: 16px; font-weight: bold;">
          ⚠️ Supervisão em Direto da Loja : ${escapeHtml(title)}
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 6px 6px; background: white;">
          <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">${escapeHtml(message)}</p>
          ${detailsHtml}
          <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
            Alerta automático gerado pelo sistema de monitorização da loja online.
          </p>
        </div>
      </div>
    `;

    return sendEmail({
      to: recipient,
      subject: `🚨 [Alerta Loja] ${title}`,
      html,
    });
  } catch (err) {
    console.error('Falha ao enviar e-mail de alerta do administrador:', err);
  }
}
