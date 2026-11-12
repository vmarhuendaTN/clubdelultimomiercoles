import { fireEvent, render, screen } from '@testing-library/react';
import { RecomendadasSesion } from './RecomendadasSesion';

const LIBROS = [
  {
    id: 'a',
    titulo: 'Crimen y castigo',
    autor: 'Fiódor Dostoievski',
    anio: '1866',
    paginas: '832',
  },
  { id: 'b', titulo: 'Rojo y negro', autor: 'Stendhal' },
];

describe('RecomendadasSesion', () => {
  it('enseña los detalles, la nota y propone un libro', () => {
    const onProponer = vi.fn();
    render(
      <RecomendadasSesion
        etiqueta="enero de 2027"
        libros={LIBROS}
        nota="En abril, autores españoles."
        elegido={(l) => l.id === 'b'}
        completo={false}
        onProponer={onProponer}
      />,
    );
    expect(screen.getByRole('heading', { name: /para enero de 2027/ })).toBeInTheDocument();
    expect(screen.getByText('1866 · 832 págs.')).toBeInTheDocument();
    expect(screen.getByText('En abril, autores españoles.')).toBeInTheDocument();
    expect(screen.getByText('En tus lecturas')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Proponer Crimen y castigo, Fiódor Dostoievski' }),
    );
    expect(onProponer).toHaveBeenCalledWith(LIBROS[0]);
  });

  it('sin libros ni nota no pinta nada', () => {
    const { container } = render(
      <RecomendadasSesion
        etiqueta="enero de 2027"
        libros={[]}
        elegido={() => false}
        completo={false}
        onProponer={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
