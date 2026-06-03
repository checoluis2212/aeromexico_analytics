import type { Metadata } from 'next';
import '../access/access-portal.css';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Acceso a la plataforma de analytics Aeroméxico. Solo usuarios dados de alta por el administrador.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
