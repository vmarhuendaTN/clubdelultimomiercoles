import { act, fireEvent, render, screen } from '@testing-library/react';
import type * as AppsScript from '@/lib/apps-script';
import { FormularioPropuesta } from './FormularioPropuesta';

const buscar = vi.hoisted(() => vi.fn());
vi.mock('@/lib/apps-script', async (original) => ({
  ...(await original<typeof AppsScript>()),
  buscarLibros: buscar,
}));

describe('FormularioPropuesta', () => {
  it('pide título, autor y nombre', () => {
    const onEnviar = vi.fn();
    render(<FormularioPropuesta onEnviar={onEnviar} enviando={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByText('Escribe el título del libro.')).toBeInTheDocument();
    expect(screen.getByText('Escribe quién lo escribió.')).toBeInTheDocument();
    expect(screen.getByText('Dinos tu nombre.')).toBeInTheDocument();
  });

  it('con el buscador se rellena y se envía con el id de Google', async () => {
    vi.useFakeTimers();
    buscar.mockResolvedValue({
      ok: true,
      libros: [
        {
          id: 'gb1234567',
          titulo: 'Tea Rooms',
          subtitulo: '',
          autores: ['Luisa Carnés'],
          anio: '2016',
          isbn: '',
          portada: '',
        },
      ],
    });
    const onEnviar = vi.fn();
    render(<FormularioPropuesta onEnviar={onEnviar} enviando={false} />);
    fireEvent.change(screen.getByLabelText('Busca el libro'), { target: { value: 'tea rooms' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    vi.useRealTimers();
    fireEvent.click(screen.getByRole('button', { name: /Tea Rooms/ }));
    fireEvent.change(screen.getByLabelText(/Tu nombre/), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).toHaveBeenCalledWith({
      titulo: 'Tea Rooms',
      autor: 'Luisa Carnés',
      motivo: '',
      propuesto_por: 'Ana',
      google_books_id: 'gb1234567',
    });
  });

  it('muestra el error de envío y bloquea el botón mientras envía', () => {
    render(<FormularioPropuesta onEnviar={vi.fn()} enviando error="Sin conexión." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión.');
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });
});
