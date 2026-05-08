import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
    }

    const { id, is_used } = await request.json();

    if (!id || typeof is_used !== 'boolean') {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update({ is_used })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cupón:', error);
      return NextResponse.json({ error: 'Error al actualizar cupón' }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (error) {
    console.error('Error in /api/admin/toggle-coupon:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
