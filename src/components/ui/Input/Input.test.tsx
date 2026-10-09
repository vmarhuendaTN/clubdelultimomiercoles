import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('asocia etiqueta, ayuda y error', () => {
    render(
      <Input label="Email" ayuda="El de tu invitación" error="Email no válido" type="email" />,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('El de tu invitación Email no válido');
  });

  it('no marca error si no lo hay', () => {
    render(<Input label="Nombre" />);
    expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('aria-invalid');
  });
});
