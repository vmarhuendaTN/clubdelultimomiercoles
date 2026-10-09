import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('es decorativo por defecto', () => {
    const { container } = render(<Icon name="libro" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('expone su etiqueta cuando la tiene', () => {
    render(<Icon name="instagram" label="Instagram" />);
    expect(screen.getByRole('img', { name: 'Instagram' })).toBeInTheDocument();
  });
});
