import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateArgentinePhone } from '@/lib/utils';
import { OrderItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Base de datos no configurada. Contactá al administrador.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, phone, deliveryType, address, notes, items } = body;

    // Validar campos requeridos
    if (!name || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nombre, teléfono y al menos un producto son requeridos.' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'El nombre debe tener al menos 2 caracteres.' },
        { status: 400 }
      );
    }

    // Validar teléfono argentino
    const phoneValidation = validateArgentinePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneValidation.normalized;

    // Validar tipo de entrega
    const validDeliveryType = deliveryType === 'envio' ? 'envio' : 'retiro';
    if (validDeliveryType === 'envio' && (!address || address.trim().length < 5)) {
      return NextResponse.json(
        { success: false, error: 'La dirección es requerida para envío a domicilio.' },
        { status: 400 }
      );
    }

    // Calcular total server-side (no confiar en el frontend)
    const totalAmount = (items as OrderItem[]).reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.quantity,
      0
    );

    // Upsert del cliente
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          name: name.trim(),
          phone: normalizedPhone,
        },
        { onConflict: 'phone' }
      )
      .select()
      .single();

    if (customerError) {
      console.error('Error al guardar cliente:', customerError);
      return NextResponse.json(
        { success: false, error: 'Error al procesar tus datos. Intentá de nuevo.' },
        { status: 500 }
      );
    }

    // Insertar pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customer.id,
        items: items as OrderItem[],
        total_amount: totalAmount,
        status: 'pendiente',
        delivery_type: validDeliveryType,
        delivery_address: validDeliveryType === 'envio' ? address.trim() : null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error al crear pedido:', orderError);
      return NextResponse.json(
        { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: '¡Pedido confirmado! Lo estamos preparando.',
    });

  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
