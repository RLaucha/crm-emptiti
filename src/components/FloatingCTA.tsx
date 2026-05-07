'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/CartContext';

export default function FloatingCTA() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { totalQuantity, setIsCartOpen } = useCart();

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          y: -8,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    };
    loadGSAP();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (totalQuantity > 0) {
      setIsCartOpen(true);
    } else {
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsCartOpen(true);
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-titi-orange hover:bg-titi-orange-dark text-white font-bold text-base px-6 py-4 rounded-full shadow-2xl transition-colors duration-300 animate-pulse-glow"
      aria-label="Ver carrito de compras"
    >
      {totalQuantity > 0 ? (
        <>
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-3 bg-white text-titi-orange text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
              {totalQuantity}
            </span>
          </div>
          <span className="hidden md:inline ml-1">Ver Pedido</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden md:inline">Hacé tu pedido</span>
          <span className="md:hidden">Pedir</span>
        </>
      )}
    </button>
  );
}
