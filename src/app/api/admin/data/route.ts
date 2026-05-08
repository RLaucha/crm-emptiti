import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select(`
        id,
        code,
        is_used,
        created_at,
        customers (
          name,
          phone,
          birth_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin data:', error);
      return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
    }

    // Formatear la data para que sea más fácil de consumir en el frontend
    const formattedData = data.map((coupon: any) => ({
      id: coupon.id,
      code: coupon.code,
      is_used: coupon.is_used,
      created_at: coupon.created_at,
      customer_name: coupon.customers?.name || 'Desconocido',
      customer_phone: coupon.customers?.phone || 'Desconocido',
      customer_birth_date: coupon.customers?.birth_date || null,
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error in /api/admin/data:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
