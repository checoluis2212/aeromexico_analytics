'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useTrackEvent } from '@/components/analytics/analytics-context';

type Props = ComponentProps<typeof Link> & {
  linkId: string;
  navZone: 'header' | 'footer' | 'hero' | 'sidebar';
};

export function TrackNavLink({ linkId, navZone, href, onClick, children, ...rest }: Props) {
  const track = useTrackEvent();

  return (
    <Link
      href={href}
      onClick={(e) => {
        track('nav_click', {
          link_id: linkId,
          destination: typeof href === 'string' ? href : href.pathname ?? '',
          nav_zone: navZone,
        });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
