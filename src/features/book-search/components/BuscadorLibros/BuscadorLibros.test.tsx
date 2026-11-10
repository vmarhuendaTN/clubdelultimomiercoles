import { act, fireEvent, render, screen } from '@testing-library/react';
import type { LibroEncontrado } from '@/lib/apps-script';
import { BuscadorLibros } from './BuscadorLibros';

const LIBRO: LibroEncontrado = {
  id: 'abc123XYZ',
  titulo: 'Sinsonte',
  subtitulo: '',
  autores: ['Walter Tevis'],
  anio: '2021',
  isbn: '9788418173',
  portada: '',
};

describe('BuscadorLibros', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function escribir(texto: string) {
    fireEvent.change(screen.getByLabelText('Buscar en Google Libros'), {
      target: { value: texto },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
  }

  it('no busca con menos de tres letras', async () => {
    const buscar = vi.fn();
    render(<BuscadorLibros onElegir={vi.fn()} buscar={buscar} />);
    await escribir('si');
    expect(buscar).not.toHaveBeenCalled();
  });

  it('muestra resultados y al elegir uno lo devuelve y limpia', async () => {
    const buscar = vi.fn().mockResolvedValue({ ok: true, libros: [LIBRO] });
    const onElegir = vi.fn();
    render(<BuscadorLibros onElegir={onElegir} buscar={buscar} />);
    await escribir('sinsonte');
    expect(buscar).toHaveBeenCalledWith('sinsonte');
    expect(screen.getByRole('status')).toHaveTextContent('1 resultado');
    fireEvent.click(screen.getByRole('button', { name: /Sinsonte/ }));
    expect(onElegir).toHaveBeenCalledWith(LIBRO);
    expect(screen.getByLabelText('Buscar en Google Libros')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /Sinsonte/ })).toBeNull();
  });

  it('si Google no responde, lo explica', async () => {
    const buscar = vi.fn().mockResolvedValue({ ok: false, error: 'google_no_responde' });
    render(<BuscadorLibros onElegir={vi.fn()} buscar={buscar} />);
    await escribir('sinsonte');
    expect(screen.getByRole('status')).toHaveTextContent(/escribir el título y el autor a mano/);
  });
});
