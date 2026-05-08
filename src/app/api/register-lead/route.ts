import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateArgentinePhone, generateCouponCode } from '@/lib/utils';

/**
 * Placeholder: Enviar mensaje de bienvenida por WhatsApp
 * Integrar con Evolution API o similar
 */
async function sendWhatsAppWelcome(phone: string, name: string, couponCode: string): Promise<void> {
  const message = `¡Hola ${name}! Bienvenido al Club de Titi. Mostrá este código en tu próximo pedido online para llevarte la 7ma empanada de regalo (comprando 6 o más): ${couponCode}. ¡Gracias por elegirnos! 🥟`;

  // TODO: Integrar con Evolution API o similar
  // Ejemplo de payload:
  // await fetch('https://tu-evolution-api.com/message/sendText/titi', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'apikey': process.env.EVOLUTION_API_KEY!,
  //   },
  //   body: JSON.stringify({
  //     number: `54${phone}`,
  //     text: message,
  //   }),
  // });

  console.log(`[WhatsApp Placeholder] Enviar a ${phone}: ${message}`);
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que Supabase está configurado
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Base de datos no configurada. Contactá al administrador.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, phone, birthDate } = body;

    // Validar campos requeridos
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nombre y teléfono son requeridos.' },
        { status: 400 }
      );
    }

    // Validar nombre (mínimo 2 caracteres)
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

    // Upsert en customers (por teléfono)
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          name: name.trim(),
          phone: normalizedPhone,
          ...(birthDate && { birth_date: birthDate }),
        },
        {
          onConflict: 'phone',
        }
      )
      .select()
      .single();

    if (customerError) {
      console.error('Error al guardar cliente:', customerError);
      return NextResponse.json(
        { success: false, error: 'Error al registrar. Intentá de nuevo.' },
        { status: 500 }
      );
    }

    // Generar cupón único
    let couponCode = generateCouponCode();

    // Verificar unicidad del código (reintentar si existe)
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from('coupons')
        .select('id')
        .eq('code', couponCode)
        .single();

      if (!existing) break;
      couponCode = generateCouponCode();
      attempts++;
    }

    // Insertar cupón
    const { error: couponError } = await supabaseAdmin
      .from('coupons')
      .insert({
        customer_id: customer.id,
        code: couponCode,
        description: '7ma Empanada de Regalo (con 6)',
        discount_type: 'item',
        value: 1,
        is_used: false,
      });

    if (couponError) {
      console.error('Error al crear cupón:', couponError);
      return NextResponse.json(
        { success: false, error: 'Error al generar cupón. Intentá de nuevo.' },
        { status: 500 }
      );
    }

    // Enviar WhatsApp (placeholder)
    await sendWhatsAppWelcome(normalizedPhone, name.trim(), couponCode);

    return NextResponse.json({
      success: true,
      couponCode,
      message: '¡Registro exitoso! Tu cupón fue generado.',
    });

  } catch (error) {
    console.error('Error en register-lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
