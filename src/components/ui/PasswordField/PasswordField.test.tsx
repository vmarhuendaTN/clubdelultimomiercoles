import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordField } from './PasswordField';

describe('PasswordField', () => {
  it('muestra y oculta la contraseña', async () => {
    render(<PasswordField label="Contraseña" autoComplete="current-password" />);
    const input = screen.getByLabelText('Contraseña');
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});
