'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import Image from 'next/image';
import { validateArgentinePhone } from '@/lib/utils';

export default function ClubPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponCode, setCouponCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // GSAP: Levitación de la tarjeta
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');

      // Entrada de la tarjeta
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
        );

        // Levitación constante
        gsap.to(cardRef.current, {
          y: -6,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        });
      }
    };

    loadGSAP();
  }, []);

  // GSAP: Hover del botón
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const btn = btnRef.current;
      if (!btn) return;

      const onEnter = () => gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
      const onLeave = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power2.out' });

      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);

      return () => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseleave', onLeave);
      };
    };

    loadGSAP();
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.length > 3) {
      const validation = validateArgentinePhone(value);
      if (!validation.isValid) {
        setPhoneError(validation.error || 'Teléfono inválido');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validar nombre
    if (name.trim().length < 2) {
      setErrorMsg('Ingresá tu nombre (mínimo 2 caracteres).');
      return;
    }

    // Validar teléfono
    const phoneValidation = validateArgentinePhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Teléfono inválido');
      return;
    }

    setStatus('loading');

    try {
      const payload: any = { name: name.trim(), phone };
      if (birthDate) payload.birthDate = birthDate;

      const res = await fetch('/api/register-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setCouponCode(data.couponCode);
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Hubo un error. Intentá de nuevo.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Error de conexión. Intentá de nuevo.');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-titi-cream via-titi-orange-light/30 to-titi-amber-light flex items-center justify-center p-4">
      {/* Detalles decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-titi-orange/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-titi-amber/10 rounded-full blur-3xl" />
      </div>

      <div
        ref={cardRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10 opacity-0"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-titi-orange shadow-lg">
            <Image
              src="/img/logo.png"
              alt="Las Empanadas de Titi"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {status === 'success' ? (
          /* ── Estado: Éxito ── */
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-titi-stone-900 mb-3">
              ¡Bienvenido al Club!
            </h1>
            <p className="text-titi-stone-500 mb-6">
              Tu código de cupón para una empanada de regalo:
            </p>
            <div className="bg-titi-cream border-2 border-titi-orange border-dashed rounded-2xl p-5 mb-6">
              <p className="text-sm text-titi-stone-500 mb-1">Tu código:</p>
              <p className="font-heading text-3xl md:text-4xl font-bold text-titi-orange tracking-wider">
                {couponCode}
              </p>
              <p className="text-xs text-titi-stone-500 mt-2">
                Mostrá este código en tu próximo pedido
              </p>
            </div>
            <p className="text-sm text-titi-stone-500">
              También te lo enviamos por WhatsApp 📱
            </p>
          </div>
        ) : (
          /* ── Estado: Formulario ── */
          <>
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-titi-stone-900 mb-2">
                ¡CLUB DE TITI! 🥟
              </h1>
              <p className="text-titi-stone-500 text-sm md:text-base leading-relaxed">
                Dejanos tu WhatsApp y llevate la{' '}
                <span className="font-bold text-titi-orange">7ma empanada de regalo</span>{' '}
                (con tu compra de 6 o más).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="club-name"
                  className="block text-sm font-semibold text-titi-stone-700 mb-1.5"
                >
                  Tu nombre
                </label>
                <input
                  id="club-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors text-titi-stone-900 placeholder:text-titi-stone-500/50"
                  required
                  disabled={status === 'loading'}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="club-phone"
                  className="block text-sm font-semibold text-titi-stone-700 mb-1.5"
                >
                  Tu WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-titi-stone-500 text-sm">
                    🇦🇷
                  </span>
                  <input
                    id="club-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="1123456789"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors text-titi-stone-900 placeholder:text-titi-stone-500/50 focus:outline-none ${
                      phoneError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-titi-stone-200 focus:border-titi-orange'
                    }`}
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>
                )}
                <p className="text-titi-stone-500/60 text-xs mt-1.5">
                  Sin el 15. Ej: 1123456789
                </p>
              </div>

              {/* Cumpleaños (Opcional) */}
              <div>
                <label
                  htmlFor="club-birthdate"
                  className="block text-sm font-semibold text-titi-stone-700 mb-1.5"
                >
                  Fecha de nacimiento <span className="text-titi-stone-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    id="club-birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors text-titi-stone-900"
                    disabled={status === 'loading'}
                  />
                </div>
                <p className="text-titi-stone-500/60 text-xs mt-1.5 flex items-center gap-1">
                  🎁 Para mandarte regalitos en tu cumple
                </p>
              </div>

              {/* Error global */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                ref={btnRef}
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-titi-orange hover:bg-titi-orange-dark text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-titi-orange/30 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  '¡QUIERO MI REGALO! 🎁'
                )}
              </button>
            </form>

            <p className="text-center text-titi-stone-500/50 text-xs mt-6">
              Al registrarte aceptás recibir novedades por WhatsApp.
              Podés darte de baja cuando quieras.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
