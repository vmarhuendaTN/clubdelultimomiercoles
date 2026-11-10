import Image from 'next/image';
import { PageHeader } from '@/components/layout';
import { ListaAgrupada, type FilaLista } from '@/components/ui';
import { logoSillon } from '@/assets/images';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { JoinForm } from './JoinForm';
import styles from './ClubPage.module.css';

const PASOS = [
  {
    titulo: 'Proponemos',
    texto: 'Cada miembro propone tres lecturas desde la web y entre todos elegimos la siguiente.',
  },
  {
    titulo: 'Leemos',
    texto: 'Dos meses para leer el libro a nuestro ritmo, cada uno en su sillón favorito.',
  },
  {
    titulo: 'Nos reunimos',
    texto: `El último miércoles del mes, a las 19:30, en la ${site.lugar.nombre}.`,
  },
] as const;

const DATOS: FilaLista[] = [
  {
    icono: 'calendario',
    titulo: 'Cuándo',
    detalle: 'El último miércoles del mes, cada dos meses, a las 19:30',
  },
  {
    icono: 'lugar',
    tono: 'granate',
    titulo: site.lugar.nombre,
    detalle: site.lugar.direccion,
    href: site.lugar.mapa,
    externo: true,
  },
  {
    icono: 'documento',
    tono: 'tinta',
    titulo: 'Documentos',
    detalle: 'Normas del club y otros documentos',
    href: routes.documentos,
  },
  {
    icono: 'libro',
    tono: 'tinta',
    titulo: 'Leer en Substack',
    detalle: 'Textos y novedades del club',
    href: site.substack,
    externo: true,
  },
  {
    icono: 'instagram',
    tono: 'granate',
    titulo: 'Instagram',
    detalle: '@elultimomiercoles',
    href: site.instagram,
    externo: true,
  },
];

/**
 * Página del club. Textos provisionales: en la Fase 3 vendrán de la pestaña
 * «Textos» de la Sheet (club_quienes_somos, club_normas).
 */
export function ClubPage() {
  return (
    <div className="contenedor">
      <PageHeader
        titulo="El club"
        subtitulo="Un club de lectura en Madrid: un libro cada dos meses y una buena conversación."
      />

      <section className={styles.intro} aria-labelledby="quienes-somos">
        <div className={styles.introTexto}>
          <h2 id="quienes-somos" className={styles.eyebrow}>
            Quiénes somos
          </h2>
          <p className={styles.entradilla}>
            Nos reunimos en Madrid el último miércoles del mes, cada dos meses, para hablar de un
            libro que hemos leído todos.
          </p>
          <p className={styles.cita}>Lo que pasa en el Club, se queda en el Club.</p>
        </div>
        <Image
          src={logoSillon.src}
          alt=""
          className={styles.ilustracion}
          sizes="(width >= 768px) 320px, 60vw"
          priority
        />
      </section>

      <section className={styles.seccion} aria-labelledby="como-funciona">
        <h2 id="como-funciona" className={styles.tituloSeccion}>
          Cómo funciona
        </h2>
        <ol className={styles.pasos}>
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className={styles.paso}>
              <span className={styles.numero} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
              <p className={styles.pasoTexto}>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.seccion} aria-labelledby="donde-cuando">
        <h2 id="donde-cuando" className={styles.tituloSeccion}>
          Dónde y cuándo
        </h2>
        <ListaAgrupada filas={DATOS} />
      </section>

      <section className={`${styles.seccion} ${styles.unirse}`} aria-labelledby="unirse">
        <div className={styles.unirseTexto}>
          <h2 id="unirse" className={styles.tituloSeccion}>
            Quiero ser del club
          </h2>
          <p className={styles.texto}>
            ¿Te apetece unirte? Déjanos tus datos y te escribimos cuando haya plaza o una sesión
            abierta.
          </p>
        </div>
        <div className={styles.formulario}>
          <JoinForm />
        </div>
      </section>
    </div>
  );
}
