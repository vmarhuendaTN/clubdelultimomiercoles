import { act, fireEvent, render, screen } from '@testing-library/react';
import type * as AppsScript from '@/lib/apps-script';
import { FormularioLectura, LECTURA_VACIA } from './FormularioLectura';

const buscar = vi.hoisted(() => vi.fn());
vi.mock('@/lib/apps-script', async (original) => ({
  ...(await original<typeof AppsScript>()),
  buscarLibros: buscar,
}));

function pintar(onGuardar = vi.fn(), inicial = LECTURA_VACIA) {
  render(
    <>
      <FormularioLectura id="f" inicial={inicial} onGuardar={onGuardar} />
      <button type="submit" form="f">
        Guardar
      </button>
    </>,
  );
  return onGuardar;
}

describe('FormularioLectura', () => {
  it('no guarda sin título ni autor y lo explica', () => {
    const onGuardar = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onGuardar).not.toHaveBeenCalled();
    expect(screen.getByText('Escribe el título.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el autor o la autora.')).toBeInTheDocument();
  });

  it('rechaza una portada que no es https', () => {
    const onGuardar = pintar(vi.fn(), {
      ...LECTURA_VACIA,
      titulo: 'T',
      autor: 'A',
      portada_manual: 'http://x',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onGuardar).not.toHaveBeenCalled();
    expect(screen.getByText(/empiece por https/)).toBeInTheDocument();
  });

  it('el buscador rellena título, autor e id, y se guarda', async () => {
    vi.useFakeTimers();
    buscar.mockResolvedValue({
      ok: true,
      libros: [
        {
          id: 'gbid12345',
          titulo: 'Sinsonte',
          subtitulo: '',
          autores: ['Walter Tevis'],
          anio: '2021',
          isbn: '9788418173',
          portada: '',
        },
      ],
    });
    const onGuardar = pintar();
    fireEvent.change(screen.getByLabelText('Buscar en Google Libros'), {
      target: { value: 'sinsonte' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    vi.useRealTimers();
    fireEvent.click(screen.getByRole('button', { name: /Sinsonte/ }));
    expect(screen.getByLabelText(/^Título/)).toHaveValue('Sinsonte');
    expect(screen.getByLabelText(/^Autor/)).toHaveValue('Walter Tevis');
    expect(screen.getByText('gbid12345')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'leido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Sinsonte',
        autor: 'Walter Tevis',
        google_books_id: 'gbid12345',
        isbn: '9788418173',
        estado: 'leido',
      }),
    );
  });
});
