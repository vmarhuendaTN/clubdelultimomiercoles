import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditorLibroDetalles } from './EditorLibroDetalles';

describe('EditorLibroDetalles', () => {
  it('pide el título y guarda todos los detalles', async () => {
    const onGuardar = vi.fn().mockResolvedValue(true);
    render(<EditorLibroDetalles textoBoton="Recomendar" ocupado={false} onGuardar={onGuardar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recomendar' }));
    expect(screen.getByText('Escribe el título.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Rojo y negro' } });
    fireEvent.change(screen.getByLabelText('Autor o autora'), { target: { value: 'Stendhal' } });
    fireEvent.change(screen.getByLabelText('Año de publicación'), { target: { value: '1830' } });
    fireEvent.change(screen.getByLabelText(/^Páginas/), { target: { value: '688 aprox.' } });
    fireEvent.change(screen.getByLabelText('Sinopsis'), { target: { value: 'Julien Sorel…' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recomendar' }));
    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith({
        titulo: 'Rojo y negro',
        autor: 'Stendhal',
        anio: '1830',
        paginas: '688 aprox.',
        sinopsis: 'Julien Sorel…',
        nota: '',
      }),
    );
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue(''));
  });

  it('al editar parte del libro y se puede cancelar', () => {
    const onCancelar = vi.fn();
    render(
      <EditorLibroDetalles
        inicial={{ titulo: 'Circe', autor: 'Madeline Miller', anio: '2018' }}
        textoBoton="Guardar cambios"
        ocupado={false}
        onGuardar={vi.fn()}
        onCancelar={onCancelar}
      />,
    );
    expect(screen.getByLabelText('Año de publicación')).toHaveValue('2018');
    expect(screen.queryByLabelText(/Buscar/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
