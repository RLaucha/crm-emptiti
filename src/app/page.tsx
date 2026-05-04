import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MenuGrid from '@/components/MenuGrid';
import FloatingCTA from '@/components/FloatingCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* Sección de servicios */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {[
                { icon: '🏠', title: 'En el local', desc: 'Vení a visitarnos' },
                { icon: '🛍️', title: 'Para llevar', desc: 'Retirá tu pedido' },
                { icon: '🛵', title: 'A domicilio', desc: '30-40 min' },
              ].map((s) => (
                <div
                  key={s.title}
                  className="text-center p-4 md:p-6 rounded-2xl bg-titi-cream border border-titi-amber/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="text-3xl md:text-4xl block mb-2">{s.icon}</span>
                  <h3 className="font-heading font-bold text-sm md:text-base text-titi-stone-900">
                    {s.title}
                  </h3>
                  <p className="text-xs md:text-sm text-titi-stone-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MenuGrid />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
