import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('es type="button" por defecto y responde al clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Entrar</Button>);
    const button = screen.getByRole('button', { name: 'Entrar' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('se renderiza como enlace con href', () => {
    render(<Button href="/lecturas/">Ver lecturas</Button>);
    expect(screen.getByRole('link', { name: 'Ver lecturas' })).toHaveAttribute(
      'href',
      '/lecturas/',
    );
  });

  it('no dispara onClick deshabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
