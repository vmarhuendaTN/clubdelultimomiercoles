import { render, screen } from '@testing-library/react';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('asocia etiqueta, ayuda y error', () => {
    render(<TextArea label="Cuéntanos" ayuda="Opcional" error="Demasiado largo" />);
    const campo = screen.getByLabelText('Cuéntanos');
    expect(campo.tagName).toBe('TEXTAREA');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Opcional Demasiado largo');
  });
});
