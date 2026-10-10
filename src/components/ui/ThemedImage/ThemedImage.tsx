import { getImageProps, type StaticImageData } from 'next/image';

type ThemedImageProps = {
  claro: StaticImageData;
  oscuro: StaticImageData;
  /** Vacío si la imagen es decorativa o el nombre accesible lo da el contenedor. */
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Imagen con variante para modo oscuro, servida con <picture> (sin JavaScript). */
export function ThemedImage({ claro, oscuro, alt, sizes, priority, className }: ThemedImageProps) {
  const common = { alt, sizes, priority };
  const { props: propsClaro } = getImageProps({ ...common, src: claro });
  const { props: propsOscuro } = getImageProps({ ...common, src: oscuro });
  return (
    <picture>
      {/* Sin optimizador (GitHub Pages) no hay srcSet: se usa la URL directa. */}
      <source media="(prefers-color-scheme: dark)" srcSet={propsOscuro.srcSet ?? propsOscuro.src} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt viene en props */}
      <img {...propsClaro} className={className} />
    </picture>
  );
}
