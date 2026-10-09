'use client';

import { usePathname } from 'next/navigation';

const normalize = (path: string) => (path.endsWith('/') ? path : `${path}/`);

/** ¿La ruta `href` es la actual (o una subruta suya, salvo inicio)? */
export function useIsActive(): (href: string) => boolean {
  const pathname = normalize(usePathname() ?? '/');
  return (href: string) => {
    const target = normalize(href);
    return target === '/' ? pathname === '/' : pathname.startsWith(target);
  };
}
