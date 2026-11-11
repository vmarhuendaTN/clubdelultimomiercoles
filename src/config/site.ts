import { routes } from './routes';

export const site = {
  nombre: 'Club del Último Miércoles',
  nombreCorto: 'Último Miércoles',
  descripcion:
    'Club de lectura que se reúne el último miércoles de cada dos meses en la Librería Celama (Madrid).',
  idioma: 'es-ES',
  email: 'elultimomiercolesclub@gmail.com',
  /** Responsable del tratamiento (política de privacidad). Si el club se constituye como
   *  asociación, añadir su denominación y NIF. */
  responsable: {
    nombre: 'Club del Último Miércoles (club de lectura, sin ánimo de lucro)',
    email: 'elultimomiercolesclub@gmail.com',
  },
  instagram: 'https://www.instagram.com/elultimomiercoles/',
  substack: 'https://idecuba.substack.com/',
  /** Perfil de Instagram incrustable (últimas publicaciones), en Galería. */
  instagramEmbed: 'https://www.instagram.com/elultimomiercoles/embed',
  /**
   * Funciones que se pueden encender o apagar sin borrar código.
   * valoraciones: estrellas y opiniones con cuenta de Google (Supabase). Apagadas por decisión
   * del club (noviembre de 2026); con `true` vuelven la sección de la ficha y la media en tarjetas.
   */
  funciones: {
    valoraciones: false,
  },
  /** Opciones de «¿De qué grupo eres?» del formulario de propuestas. Vacío = campo de texto libre. */
  gruposClub: [] as readonly string[],
  /** Hora de las sesiones (Madrid) y duración aproximada, para la cuenta atrás y el calendario. */
  sesion: { hora: '19:30', zona: 'Europe/Madrid', duracionMin: 120 },
  lugar: {
    nombre: 'Librería Celama',
    direccion: 'C/ Don Ramón de la Cruz, 93, Madrid',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Librer%C3%ADa+Celama+Don+Ram%C3%B3n+de+la+Cruz+93+Madrid',
  },
  colores: {
    tema: '#FBF7EF',
    temaOscuro: '#141210',
  },
} as const;

export type NavItem = {
  href: string;
  etiqueta: string;
  icono: 'inicio' | 'lecturas' | 'galeria' | 'club' | 'perfil';
};

/** Pestañas de la TabBar (móvil) y de la barra superior (escritorio). DISENO § 4. */
export const navegacion: readonly NavItem[] = [
  { href: routes.inicio, etiqueta: 'Inicio', icono: 'inicio' },
  { href: routes.lecturas, etiqueta: 'Lecturas', icono: 'lecturas' },
  { href: routes.galeria, etiqueta: 'Galería', icono: 'galeria' },
  { href: routes.elClub, etiqueta: 'El club', icono: 'club' },
  // «Entrar» se añade con el login (Fase 2).
];
