'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { WHATSAPP_LINK } from '@/lib/menu-data';

export default function CartSidebar() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    totalPrice,
    totalQuantity,
    updateQuantity,
    removeItem,
  } = useCart();
  
  const sidebarRef = useRef<HTMLDivElement>(null);

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
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen, setIsCartOpen]);

  // Generate WhatsApp message
  const handleCheckout = () => {
    let message = '¡Hola! Quiero hacer un pedido: 🥟\n\n';
    
    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString('es-AR')})\n`;
    });
    
    message += `\n*Total:* $${totalPrice.toLocaleString('es-AR')}\n\n`;
    message += `Mi nombre es: ____ y quiero (retirar por el local / envío a domicilio a la dirección ____).`;
    
    const url = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
          <h2 className="font-heading text-xl font-bold text-titi-stone-900 flex items-center gap-2">
            <span>Tu Pedido</span>
            <span className="bg-titi-orange text-white text-xs px-2 py-0.5 rounded-full">
              {totalQuantity}
            </span>
          </h2>
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

        {/* Content */}
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-titi-stone-200 p-5 bg-titi-stone-50">
            <div className="flex justify-between items-center mb-4 text-lg">
              <span className="font-semibold text-titi-stone-700">Total:</span>
              <span className="font-bold text-2xl text-titi-stone-900">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-titi-green hover:bg-titi-green-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
74:               </svg>
75:               Pedir por WhatsApp
76:             </button>
77:           </div>
78:         )}
79:       </div>
80:     </>
81:   );
82: }
