import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Button.module.css';

type Variant = 'primario' | 'secundario' | 'sencillo';
type Size = 'md' | 'sm';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  anchoCompleto?: boolean;
  icono?: IconName;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Botón principal mostaza, secundario o sencillo. Con `href` se renderiza como enlace. */
export function Button(props: ButtonProps) {
  const {
    variant = 'primario',
    size = 'md',
    anchoCompleto = false,
    icono,
    children,
    className,
    ...rest
  } = props;
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    anchoCompleto && styles.anchoCompleto,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {icono && <Icon name={icono} size={size === 'sm' ? 'sm' : 'md'} />}
      <span>{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as Omit<ButtonAsLink, keyof CommonProps>)}>
        {content}
      </Link>
    );
  }
  const { type = 'button', ...buttonRest } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
