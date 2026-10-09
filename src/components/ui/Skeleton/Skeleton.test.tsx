import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('queda oculto a tecnologías de apoyo', () => {
    const { container } = render(<Skeleton forma="portada" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
