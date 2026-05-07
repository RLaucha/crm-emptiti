'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

export default function Header() {
  const { totalQuantity, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-titi-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Nombre */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-titi-orange transition-transform group-hover:scale-105">
            <Image
              src="/img/logo.png"
              alt="Las Empanadas de Titi"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-heading text-lg md:text-xl font-bold text-titi-stone-900 leading-tight">
              Las Empanadas de Titi
            </h1>
            <p className="text-xs text-titi-stone-500 -mt-0.5">
              Un gol de media cancha ⚽
            </p>
          </div>
        </Link>

        {/* CTA WhatsApp / Carrito */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 bg-titi-green hover:bg-titi-green-dark text-white font-semibold text-sm md:text-base px-4 py-2.5 md:px-5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {totalQuantity > 0 ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Ver Carrito ({totalQuantity})</span>
              <span className="sm:hidden">({totalQuantity})</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Hacer Pedido</span>
              <span className="sm:hidden">Pedir</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
