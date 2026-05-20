'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';

type CheckoutStep = 1 | 2 | 3;
type DeliveryType = 'retiro' | 'envio';

export default function CartSidebar() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    totalPrice,
    totalQuantity,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Checkout form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retiro');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen, setIsCartOpen]);

  // Reset to step 1 when sidebar closes
  useEffect(() => {
    if (!isCartOpen) {
      // Delay reset so animation finishes
      const timer = setTimeout(() => {
        if (checkoutStep !== 3) {
          setCheckoutStep(1);
        }
        setError('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen, checkoutStep]);

  const handleCheckout = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        deliveryType,
        address: deliveryType === 'envio' ? address.trim() : null,
        notes: notes.trim() || null,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setCheckoutStep(3);
      } else {
        setError(data.error || 'Error al procesar el pedido.');
      }
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    clearCart();
    setCheckoutStep(1);
    setName('');
    setPhone('');
    setDeliveryType('retiro');
    setAddress('');
    setNotes('');
    setError('');
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-titi-stone-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-titi-stone-200">
          <div className="flex items-center gap-2">
            {checkoutStep === 2 && (
              <button
                onClick={() => { setCheckoutStep(1); setError(''); }}
                className="p-1.5 text-titi-stone-500 hover:text-titi-stone-900 hover:bg-titi-stone-100 rounded-full transition-colors"
                aria-label="Volver al carrito"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="font-heading text-xl font-bold text-titi-stone-900 flex items-center gap-2">
              <span>
                {checkoutStep === 1 && 'Tu Pedido'}
                {checkoutStep === 2 && 'Datos del Pedido'}
                {checkoutStep === 3 && '¡Confirmado!'}
              </span>
              {checkoutStep === 1 && (
                <span className="bg-titi-orange text-white text-xs px-2 py-0.5 rounded-full">
                  {totalQuantity}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-titi-stone-500 hover:text-titi-stone-900 hover:bg-titi-stone-100 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ══════════════════════════════════ */}
        {/* STEP 1: Cart Items */}
        {/* ══════════════════════════════════ */}
        {checkoutStep === 1 && (
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-6xl">🥟</div>
                <div>
                  <p className="text-lg font-bold text-titi-stone-900">Tu carrito está vacío</p>
                  <p className="text-titi-stone-500 mt-1">¡Agregá algunas empanadas para empezar!</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 bg-titi-stone-100 hover:bg-titi-stone-200 text-titi-stone-700 font-semibold rounded-full transition-colors"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 bg-white border border-titi-stone-200 p-3 rounded-2xl shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-titi-stone-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-titi-stone-900 text-sm leading-tight pr-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-titi-stone-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-semibold text-titi-orange">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </div>
                        
                        <div className="flex items-center bg-titi-stone-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-titi-stone-600 hover:text-titi-stone-900 hover:bg-titi-stone-200 rounded-l-lg transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-titi-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-titi-stone-600 hover:text-titi-stone-900 hover:bg-titi-stone-200 rounded-r-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* STEP 2: Checkout Form */}
        {/* ══════════════════════════════════ */}
        {checkoutStep === 2 && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-5">
              {/* Resumen rápido */}
              <div className="bg-titi-stone-50 rounded-xl p-3 border border-titi-stone-100">
                <p className="text-sm text-titi-stone-500">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} · <span className="font-bold text-titi-stone-900">${totalPrice.toLocaleString('es-AR')}</span>
                </p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-titi-stone-700 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-titi-stone-700 mb-1.5">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors"
                  placeholder="1123456789"
                  required
                />
              </div>

              {/* Tipo de entrega */}
              <div>
                <label className="block text-sm font-semibold text-titi-stone-700 mb-2">
                  Tipo de Entrega *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retiro')}
                    className={`p-3 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                      deliveryType === 'retiro'
                        ? 'border-titi-orange bg-titi-orange/5 text-titi-orange'
                        : 'border-titi-stone-200 text-titi-stone-500 hover:border-titi-stone-300'
                    }`}
                  >
                    🏠 Retiro en local
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('envio')}
                    className={`p-3 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                      deliveryType === 'envio'
                        ? 'border-titi-orange bg-titi-orange/5 text-titi-orange'
                        : 'border-titi-stone-200 text-titi-stone-500 hover:border-titi-stone-300'
                    }`}
                  >
                    🛵 Envío a domicilio
                  </button>
                </div>
              </div>

              {/* Dirección (condicional) */}
              {deliveryType === 'envio' && (
                <div className="animate-[fadeIn_0.2s_ease-out]">
                  <label className="block text-sm font-semibold text-titi-stone-700 mb-1.5">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors"
                    placeholder="Calle, Número, Piso"
                    required
                  />
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-titi-stone-700 mb-1.5">
                  Notas <span className="text-titi-stone-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors resize-none"
                  placeholder="Ej: Sin picante, timbre 2B..."
                  rows={2}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200 text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* STEP 3: Confirmation */}
        {/* ══════════════════════════════════ */}
        {checkoutStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-titi-green/10 rounded-full flex items-center justify-center mb-6 animate-[bounceIn_0.5s_ease-out]">
              <svg className="w-10 h-10 text-titi-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-bold text-titi-stone-900 mb-2">
              ¡Pedido Confirmado!
            </h3>
            <p className="text-titi-stone-500 mb-6">
              Lo estamos preparando. Te avisamos cuando esté listo. 🥟
            </p>
            <div className="bg-titi-stone-50 rounded-xl p-4 w-full max-w-xs mb-6 border border-titi-stone-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-titi-stone-500">Total</span>
                <span className="font-bold text-titi-stone-900">${totalPrice.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-titi-stone-500">Entrega</span>
                <span className="font-semibold text-titi-stone-700">
                  {deliveryType === 'retiro' ? '🏠 Retiro en local' : '🛵 Envío'}
                </span>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-titi-stone-900 hover:bg-titi-stone-700 text-white font-bold rounded-xl transition-colors"
            >
              Volver al Menú
            </button>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* Footer (Step 1 & 2) */}
        {/* ══════════════════════════════════ */}
        {checkoutStep === 1 && items.length > 0 && (
          <div className="border-t border-titi-stone-200 p-5 bg-titi-stone-50">
            <div className="flex justify-between items-center mb-4 text-lg">
              <span className="font-semibold text-titi-stone-700">Total:</span>
              <span className="font-bold text-2xl text-titi-stone-900">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="bg-titi-orange/10 border border-titi-orange/20 rounded-xl p-3 mb-4 text-center">
              <p className="text-sm text-titi-stone-700">
                ¿Llevas media docena? <br/>
                <a href="/club" className="font-bold text-titi-orange hover:text-titi-amber underline decoration-titi-orange/30 underline-offset-2">Unite al Club Titi y la 7ma va de regalo 🥟</a>
              </p>
            </div>
            
            <button
              onClick={() => setCheckoutStep(2)}
              className="w-full flex items-center justify-center gap-2 bg-titi-orange hover:bg-titi-orange-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Continuar al Checkout
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {checkoutStep === 2 && (
          <div className="border-t border-titi-stone-200 p-5 bg-titi-stone-50">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || !name.trim() || !phone.trim() || (deliveryType === 'envio' && !address.trim())}
              className="w-full flex items-center justify-center gap-2 bg-titi-green hover:bg-titi-green-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Pedido
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
