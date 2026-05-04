import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Club de Titi | Empanada de Regalo',
  description:
    'Unite al Club de Titi y llevate una empanada de regalo en tu próxima compra. Dejanos tu WhatsApp y recibí tu cupón al instante.',
};

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
