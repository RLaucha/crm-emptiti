'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { WHATSAPP_LINK } from '@/lib/menu-data';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.3'
        );
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/hero.png"
          alt="Empanadas artesanales de Titi"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h2
          ref={titleRef}
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight opacity-0"
        >
          Empanadas y canastitas
          <span className="block text-titi-amber mt-1">que son un gol</span>
        </h2>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-lg mx-auto opacity-0"
        >
          Hechas con amor en Caballito desde siempre. En el local, para llevar o
          te las llevamos a tu casa. ⚽🥟
        </p>

        <button
          ref={ctaRef}
          onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-3 bg-titi-orange hover:bg-titi-orange-dark text-white font-bold text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-2xl opacity-0 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
          Ver el Menú
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
