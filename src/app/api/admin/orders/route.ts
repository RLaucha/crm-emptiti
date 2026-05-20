import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
    }

    // Obtener pedidos del día con datos del cliente
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        items,
        total_amount,
        status,
        delivery_type,
        delivery_address,
        notes,
        created_at,
        customers (
          name,
          phone
        )
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Error al cargar pedidos' }, { status: 500 });
    }

    const formattedOrders = (data || []).map((order: any) => ({
      id: order.id,
      items: order.items,
      total_amount: order.total_amount,
      status: order.status,
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_address,
      notes: order.notes,
      created_at: order.created_at,
      customer_name: order.customers?.name || 'Desconocido',
      customer_phone: order.customers?.phone || 'Desconocido',
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Error in /api/admin/orders:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
