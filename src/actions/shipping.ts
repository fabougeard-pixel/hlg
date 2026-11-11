'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

function revalidateShippingPaths() {
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
  revalidatePath('/cart');
  revalidatePath('/');
}

// --- ZONES ---

export async function getShippingZones() {
  await requireAdmin();
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { name: 'asc' },
      include: {
        methods: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return zones;
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return [];
  }
}

export async function createShippingZone(data: { name: string; isActive?: boolean }) {
  await requireAdmin();
  try {
    const zone = await prisma.shippingZone.create({
      data,
    });
    revalidateShippingPaths();
    return { success: true, zone };
  } catch (error: any) {
    console.error('Error creating shipping zone:', error);
    return { success: false, error: error.message };
  }
}

export async function updateShippingZone(id: string, data: { name?: string; isActive?: boolean }) {
  await requireAdmin();
  try {
    const zone = await prisma.shippingZone.update({
      where: { id },
      data,
    });
    revalidateShippingPaths();
    return { success: true, zone };
  } catch (error: any) {
    console.error('Error updating shipping zone:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingZone(id: string) {
  await requireAdmin();
  try {
    await prisma.shippingZone.delete({
      where: { id },
    });
    revalidateShippingPaths();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting shipping zone:', error);
    return { success: false, error: error.message };
  }
}

// --- METHODS ---

export async function addShippingMethod(zoneId: string, data: { type: string; rate: number; minOrderAmount?: number | null; isActive?: boolean }) {
  await requireAdmin();
  try {
    const method = await prisma.shippingMethod.create({
      data: {
        zoneId,
        type: data.type,
        rate: data.rate,
        minOrderAmount: data.minOrderAmount ?? null,
        isActive: data.isActive
      }
    });
    revalidateShippingPaths();
    return { success: true, method };
  } catch (error: any) {
    console.error('Error adding shipping method:', error);
    return { success: false, error: error.message };
  }
}

export async function updateShippingMethod(id: string, data: { type?: string; rate?: number; minOrderAmount?: number | null; isActive?: boolean }) {
  await requireAdmin();
  try {
    const method = await prisma.shippingMethod.update({
      where: { id },
      data,
    });
    revalidateShippingPaths();
    return { success: true, method };
  } catch (error: any) {
    console.error('Error updating shipping method:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingMethod(id: string) {
  await requireAdmin();
  try {
    await prisma.shippingMethod.delete({
      where: { id },
    });
    revalidateShippingPaths();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting shipping method:', error);
    return { success: false, error: error.message };
  }
}
