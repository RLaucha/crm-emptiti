import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Placeholder: Enviar WhatsApp cuando el pedido está en camino
 * Integrar con Evolution API o similar
 */
async function sendWhatsAppDelivery(phone: string, name: string): Promise<void> {
  const message = `¡Buenas noticias ${name}! Tu pedido de Titi ya va en viaje con el cadete. 🥟`;

  // TODO: Integrar con Evolution API o similar
  console.log(`[WhatsApp Placeholder] Enviar a ${phone}: ${message}`);
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const validStatuses = ['pendiente', 'cocina', 'en_camino', 'entregado'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando pedido:', error);
      return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
    }

    // Disparar WhatsApp cuando cambia a 'en_camino'
    if (status === 'en_camino' && data?.customers) {
      await sendWhatsAppDelivery(
        data.customers.phone,
        data.customers.name
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('Error in /api/admin/update-order:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
