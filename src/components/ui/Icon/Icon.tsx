import {
  BookOpen,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  CircleAlert,
  ExternalLink,
  Eye,
  EyeOff,
  House,
  Images,
  Info,
  Library,
  MapPin,
  Search,
  Sofa,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { IconGoogle, IconInstagram } from '@/assets/icons';
import styles from './Icon.module.css';

/** Único set de iconos (Lucide, trazo 1,75). Añadir aquí los que se necesiten. */
const icons = {
  inicio: House,
  lecturas: Library,
  galeria: Images,
  club: Sofa,
  perfil: UserRound,
  libro: BookOpen,
  calendario: CalendarPlus,
  lugar: MapPin,
  buscar: Search,
  cerrar: X,
  anterior: ChevronLeft,
  siguiente: ChevronRight,
  ver: Eye,
  ocultar: EyeOff,
  exito: Check,
  error: CircleAlert,
  info: Info,
  instagram: IconInstagram,
  google: IconGoogle,
  documento: FileText,
  externo: ExternalLink,
  estrella: Star,
  descargar: Download,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  /** Si el icono transmite información por sí solo, su texto alternativo. Si no, es decorativo. */
  label?: string;
  className?: string;
};

export function Icon({ name, size = 'md', label, className }: IconProps) {
  const Component = icons[name];
  return (
    <Component
      className={[styles.icon, styles[size], className].filter(Boolean).join(' ')}
      strokeWidth={1.75}
      focusable="false"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
