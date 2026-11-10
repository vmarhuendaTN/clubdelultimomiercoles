import { fireEvent, render, screen } from '@testing-library/react';
import type { LibroPropuesto } from '../../services/resumen-propuestas';
import { RankingLibros } from './RankingLibros';

const libro = (n: number, cambios: Partial<LibroPropuesto> = {}): LibroPropuesto => ({
  clave: `l${n}`,
  texto: `Libro ${n}`,
  personas: [{ id: 'p', nombre: 'Ana García', posicion: 1 }],
  votos: 1,
  puntos: 3,
  otrosPeriodos: [],
  ...cambios,
});

describe('RankingLibros', () => {
  it('sin libros lo dice', () => {
    render(<RankingLibros libros={[]} onAnadir={vi.fn()} />);
    expect(screen.getByText(/Todavía no hay lecturas propuestas/)).toBeInTheDocument();
  });

  it('muestra cifras, coincidencias, sesiones anteriores y quién lo propuso', () => {
    render(
      <RankingLibros
        libros={[
          libro(1, {
            texto: 'Circe',
            votos: 2,
            puntos: 5,
            personas: [
              { id: 'a', nombre: 'Ana García', posicion: 1 },
              { id: 'b', nombre: 'Luis Pérez', posicion: 2 },
            ],
            otrosPeriodos: ['Noviembre de 2026'],
          }),
        ]}
        onAnadir={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Circe' })).toBeInTheDocument();
    expect(screen.getByText('2 personas · 5 puntos')).toBeInTheDocument();
    expect(screen.getByText('Coincidencia')).toBeInTheDocument();
    expect(screen.getByText('También en Noviembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Ana G. (1.ª), Luis P. (2.ª)')).toBeInTheDocument();
  });

  it('enseña los primeros y deja ver todos; «Lecturas» lo pasa al editor', () => {
    const onAnadir = vi.fn();
    const libros = Array.from({ length: 5 }, (_, i) => libro(i + 1));
    render(<RankingLibros libros={libros} inicial={3} onAnadir={onAnadir} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Ver los 5 libros' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir «Libro 2» a lecturas' }));
    expect(onAnadir).toHaveBeenCalledWith(libros[1]);
  });
});
