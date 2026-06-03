import type { Metadata } from 'next';
import './access-portal.css';

export const metadata: Metadata = {
  title: 'Restricted Access',
  description:
    'Pre-Entry Access Portal. Submit an access request for administrator review before entering the platform.',
  robots: { index: false, follow: false },
};

export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
