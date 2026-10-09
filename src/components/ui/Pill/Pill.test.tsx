import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';

describe('Pill', () => {
  it('muestra su contenido', () => {
    render(<Pill variant="acento">2024</Pill>);
    expect(screen.getByText('2024')).toBeInTheDocument();
  });
});
