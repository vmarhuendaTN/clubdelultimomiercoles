import { Button, Pill } from '@/components/ui';
import { porAnio, type SesionClub } from '../../services/sesiones';
import styles from './ArchivoSesiones.module.css';

type ArchivoSesionesProps = {
  sesiones: SesionClub[];
  esAdmin: boolean;
  ocupado: boolean;
  onVer: (clave: string) => void;
  onArchivar: (clave: string, archivar: boolean) => void;
};

const media = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

function resumen(s: SesionClub): string {
  return [
    `${s.personas} ${s.personas === 1 ? 'persona' : 'personas'}`,
    `${s.libros} ${s.libros === 1 ? 'libro' : 'libros'}`,
    s.candidatas > 0 && `${s.candidatas} ${s.candidatas === 1 ? 'candidata' : 'candidatas'}`,
    s.votantes > 0 && `${s.votantes} ${s.votantes === 1 ? 'voto' : 'votos'}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

function Fila({
  sesion,
  titulo,
  esAdmin,
  ocupado,
  onVer,
  onArchivar,
}: { sesion: SesionClub; titulo: string } & Omit<ArchivoSesionesProps, 'sesiones'>) {
  return (
    <li className={styles.fila}>
      <div className={styles.datos}>
        <div className={styles.cabecera}>
          <h5 className={styles.nombre}>{titulo}</h5>
          {sesion.votacionAbierta && <Pill variant="mostaza">Votación abierta</Pill>}
        </div>
        <p className={styles.meta}>{resumen(sesion)}</p>
        <p className={styles.ganadora}>
          {sesion.ganadora
            ? `Ganó «${sesion.ganadora.titulo}»${sesion.ganadora.autor ? `, de ${sesion.ganadora.autor}` : ''} · ${media.format(sesion.ganadora.media)} ★`
            : sesion.candidatas
              ? 'Votación sin votos todavía'
              : 'Sin votación'}
        </p>
      </div>
      <div className={styles.acciones}>
        <Button
          variant="secundario"
          size="sm"
          onClick={() => onVer(sesion.clave)}
          aria-label={`Ver ${sesion.etiqueta}`}
        >
          Ver
        </Button>
        {esAdmin && (
          <Button
            variant="sencillo"
            size="sm"
            disabled={ocupado}
            onClick={() => onArchivar(sesion.clave, !sesion.archivada)}
            aria-label={`${sesion.archivada ? 'Desarchivar' : 'Archivar'} ${sesion.etiqueta}`}
          >
            {sesion.archivada ? 'Desarchivar' : 'Archivar'}
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * Todas las sesiones del club: las que están en curso arriba y el archivo agrupado por años.
 * Archivar deja espacio a lo nuevo sin borrar nada.
 */
export function ArchivoSesiones(props: ArchivoSesionesProps) {
  const { sesiones } = props;
  const enCurso = sesiones.filter((s) => !s.archivada);
  const archivadas = porAnio(sesiones.filter((s) => s.archivada));

  return (
    <div className={styles.archivo}>
      <section className={styles.bloque} aria-labelledby="sesiones-en-curso">
        <div>
          <h3 id="sesiones-en-curso" className={styles.titulo}>
            En curso
          </h3>
          <p className={styles.ayuda}>
            Las sesiones que salen en el selector. Cuando una termine, archívala para dejar sitio a
            la siguiente: no se borra nada.
          </p>
        </div>
        {enCurso.length ? (
          <ul className={styles.lista}>
            {enCurso.map((s) => (
              <Fila key={s.clave} sesion={s} titulo={s.etiqueta} {...props} />
            ))}
          </ul>
        ) : (
          <p className={styles.vacio}>No hay sesiones en curso.</p>
        )}
      </section>

      <section className={styles.bloque} aria-labelledby="sesiones-archivadas">
        <h3 id="sesiones-archivadas" className={styles.titulo}>
          Archivo
        </h3>
        {archivadas.length ? (
          archivadas.map((grupo) => (
            <section
              key={grupo.anio}
              className={styles.anio}
              aria-labelledby={`anio-${grupo.anio}`}
            >
              <h4 id={`anio-${grupo.anio}`} className={styles.anioTitulo}>
                {grupo.anio}
                <span className={styles.anioCuenta}>
                  {grupo.sesiones.length} {grupo.sesiones.length === 1 ? 'sesión' : 'sesiones'}
                </span>
              </h4>
              <ul className={styles.lista}>
                {grupo.sesiones.map((s) => (
                  <Fila
                    key={s.clave}
                    sesion={s}
                    titulo={s.etiqueta.replace(/ de \d{4}$/, '')}
                    {...props}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className={styles.vacio}>Todavía no hay sesiones archivadas.</p>
        )}
      </section>
    </div>
  );
}
