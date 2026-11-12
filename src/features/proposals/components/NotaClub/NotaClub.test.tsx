import { render, screen } from '@testing-library/react';
import { NotaClub } from './NotaClub';

describe('NotaClub', () => {
  it('separa los párrafos', () => {
    render(<NotaClub nota={'Primera nota.\n\nSegunda nota.'} />);
    expect(screen.getByRole('complementary', { name: 'Notas del club' })).toBeInTheDocument();
    expect(screen.getByText('Primera nota.')).toBeInTheDocument();
    expect(screen.getByText('Segunda nota.')).toBeInTheDocument();
  });

  it('sin nota no pinta nada', () => {
    const { container } = render(<NotaClub nota="  " />);
    expect(container).toBeEmptyDOMElement();
  });
});
