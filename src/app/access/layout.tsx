import type { Metadata } from 'next';
import './access-portal.css';

export const metadata: Metadata = {
  title: 'Acceso restringido',
  description:
    'Portal de acceso previo Aeroméxico. Solicita acceso con tu correo corporativo; un administrador revisará tu solicitud.',
};

export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
