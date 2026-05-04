'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { menuItems } from '@/lib/menu-data';
import type { MenuItem } from '@/lib/types';

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="menu-card group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-titi-stone-200/50 hover:border-titi-orange/30 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-44 md:h-52 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {item.featured && (
          <div className="absolute top-3 right-3 bg-titi-amber text-titi-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ⭐ Destacada
          </div>
        )}
        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-titi-stone-900 font-bold text-lg px-3 py-1 rounded-xl shadow-md">
          ${item.price.toLocaleString('es-AR')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg md:text-xl font-bold text-titi-stone-900 group-hover:text-titi-orange transition-colors">
            {item.name}
          </h3>
          <span className="flex-shrink-0 text-xs uppercase font-semibold bg-titi-stone-100 text-titi-stone-500 px-2 py-1 rounded-md">
            {item.category === 'empanada' ? '🥟' : '🧺'}
          </span>
        </div>
        <p className="text-sm text-titi-stone-500 mt-2 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function MenuGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'empanada' | 'canastita'>('all');

  const filteredItems = activeFilter === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === activeFilter);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Staggered entry animation
      const cards = sectionRef.current?.querySelectorAll('.menu-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    };

    // Small delay to ensure DOM is ready after filter
    const timer = setTimeout(loadGSAP, 100);
    return () => clearTimeout(timer);
  }, [activeFilter]);

  return (
    <section id="menu" className="py-16 md:py-24 bg-titi-stone-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-titi-orange font-semibold text-sm uppercase tracking-wider">
            Nuestro Menú
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-titi-stone-900 mt-2">
            Nuestras Empanadas y Canastitas
          </h2>
          <p className="text-titi-stone-500 mt-3 max-w-lg mx-auto">
            Todas hechas a mano, con ingredientes frescos y la receta que nos caracteriza desde siempre.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 md:gap-3 mb-10">
          {[
            { key: 'all' as const, label: 'Todas', emoji: '🍽️' },
            { key: 'empanada' as const, label: 'Empanadas', emoji: '🥟' },
            { key: 'canastita' as const, label: 'Canastitas', emoji: '🧺' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-titi-orange text-white shadow-lg shadow-titi-orange/30 scale-105'
                  : 'bg-white text-titi-stone-700 hover:bg-titi-orange-light border border-titi-stone-200'
              }`}
            >
              <span>{filter.emoji}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={sectionRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* Count */}
        <p className="text-center text-titi-stone-500 text-sm mt-8">
          {filteredItems.length} {filteredItems.length === 1 ? 'variedad' : 'variedades'} disponibles
        </p>
      </div>
    </section>
  );
}
