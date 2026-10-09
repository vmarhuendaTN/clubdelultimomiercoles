'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui';
import { navegacion } from '@/config/site';
import { useIsActive } from './use-is-active';
import styles from './NavLinks.module.css';

type NavLinksProps = {
  /** `barra`: enlaces de texto (escritorio); `pestanas`: icono + etiqueta (TabBar). */
  estilo: 'barra' | 'pestanas';
};

export function NavLinks({ estilo }: NavLinksProps) {
  const isActive = useIsActive();
  return (
    <ul role="list" className={styles[estilo]}>
      {navegacion.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.link}
              aria-current={active ? 'page' : undefined}
            >
              {estilo === 'pestanas' && <Icon name={item.icono} size="lg" />}
              <span className={styles.etiqueta}>{item.etiqueta}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
