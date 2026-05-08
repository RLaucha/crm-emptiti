import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD is not set in environment variables.');
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta.' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      
      // Establecemos la cookie
      response.cookies.set({
        name: 'admin_token',
        value: 'authenticated',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'lax',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en admin login:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando la solicitud.' },
      { status: 500 }
    );
  }
}
