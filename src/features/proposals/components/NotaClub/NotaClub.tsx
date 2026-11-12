import styles from './NotaClub.module.css';

type NotaClubProps = { nota?: string; titulo?: string };

/** Notas del club para una sesión (cada párrafo separado por una línea en blanco). */
export function NotaClub({ nota, titulo = 'Notas del club' }: NotaClubProps) {
  const parrafos = (nota ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parrafos.length === 0) return null;
  return (
    <aside className={styles.nota} aria-label={titulo}>
      <p className={styles.titulo}>{titulo}</p>
      {parrafos.map((p, i) => (
        <p key={i} className={styles.texto}>
          {p}
        </p>
      ))}
    </aside>
  );
}
