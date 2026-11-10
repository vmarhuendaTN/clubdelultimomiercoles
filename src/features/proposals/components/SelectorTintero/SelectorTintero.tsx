import { Chip, Select } from '@/components/ui';
import { textoLibro, type LibroOpcion } from '../../services/opciones';
import styles from './SelectorTintero.module.css';

type SelectorTinteroProps = {
  /** Lecturas que aún se pueden elegir (ya sin las elegidas ni las propuestas arriba). */
  disponibles: LibroOpcion[];
  elegidas: LibroOpcion[];
  onCambiar: (elegidas: LibroOpcion[]) => void;
  /** Mensaje cuando no se han podido cargar las lecturas del tintero. */
  aviso?: string;
};

/**
 * «Lecturas en el tintero»: desplegable con las que tiene el club pendientes. Cada una que se
 * elige pasa a la lista de abajo y desaparece del desplegable; con la × vuelve a él.
 */
export function SelectorTintero({ disponibles, elegidas, onCambiar, aviso }: SelectorTinteroProps) {
  const opciones = [
    {
      value: '',
      label: disponibles.length ? 'Elige una lectura…' : 'No quedan más lecturas en el tintero',
    },
    ...disponibles.map((l) => ({ value: l.id, label: textoLibro(l) })),
  ];

  return (
    <div className={styles.tintero}>
      <Select
        label="Lecturas en el tintero que te gustaría hacer"
        ayuda={aviso ?? 'Opcional. Puedes elegir varias.'}
        opciones={opciones}
        value=""
        disabled={disponibles.length === 0}
        onChange={(e) => {
          const libro = disponibles.find((l) => l.id === e.target.value);
          if (libro) onCambiar([...elegidas, libro]);
        }}
      />
      {elegidas.length > 0 && (
        <ul className={styles.elegidas} aria-label="Lecturas del tintero elegidas">
          {elegidas.map((libro) => (
            <li key={libro.id}>
              <Chip
                onQuitar={() => onCambiar(elegidas.filter((l) => l.id !== libro.id))}
                etiqueta={`Quitar ${textoLibro(libro)}`}
              >
                {textoLibro(libro)}
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
