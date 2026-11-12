import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PegarMensaje } from './PegarMensaje';

const MENSAJE = `1. Crimen y castigo, de Fiódor Dostoievski (1866) - 832 págs. aprox.
Raskólnikov…
2. Rojo y negro, de Stendhal (1830) - 688 págs. aprox.
Julien Sorel…
NOTA 1:
Las páginas son aproximadas.`;

describe('PegarMensaje', () => {
  it('lee el mensaje, enseña lo que ha encontrado y lo añade', async () => {
    const onImportar = vi.fn().mockResolvedValue(true);
    render(
      <PegarMensaje textoBoton="Añadir a la votación" ocupado={false} onImportar={onImportar} />,
    );
    fireEvent.change(screen.getByLabelText(/Pega aquí el mensaje/), { target: { value: MENSAJE } });
    fireEvent.click(screen.getByRole('button', { name: 'Leer el mensaje' }));
    expect(screen.getByText('2 libros y notas de la sesión:')).toBeInTheDocument();
    expect(screen.getByText(/1866 · 832 págs. aprox./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a la votación' }));
    await waitFor(() => expect(onImportar).toHaveBeenCalled());
    const [libros, notas] = onImportar.mock.calls[0]!;
    expect(libros).toHaveLength(2);
    expect(notas).toBe('Las páginas son aproximadas.');
    await waitFor(() => expect(screen.getByLabelText(/Pega aquí el mensaje/)).toHaveValue(''));
  });

  it('avisa si no hay lista numerada', () => {
    render(<PegarMensaje textoBoton="Recomendar" ocupado={false} onImportar={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Pega aquí el mensaje/), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByRole('button', { name: 'Leer el mensaje' }));
    expect(screen.getByText(/No encuentro libros/)).toBeInTheDocument();
  });
});
