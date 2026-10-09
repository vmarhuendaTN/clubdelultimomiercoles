import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('se abre como diálogo con título accesible y se cierra', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <BottomSheet open={false} onClose={onClose} titulo="Filtros">
        <p>Contenido</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('open');

    rerender(
      <BottomSheet open onClose={onClose} titulo="Filtros">
        <p>Contenido</p>
      </BottomSheet>,
    );
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
