import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

function Lanzador() {
  const { mostrar } = useToast();
  return (
    <button type="button" onClick={() => mostrar('Publicado', 'exito')}>
      Publicar
    </button>
  );
}

describe('Toast', () => {
  it('anuncia el aviso en una región viva y se puede cerrar', async () => {
    render(
      <ToastProvider>
        <Lanzador />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Publicado');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('exige el proveedor', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Lanzador />)).toThrow(/ToastProvider/);
  });
});
