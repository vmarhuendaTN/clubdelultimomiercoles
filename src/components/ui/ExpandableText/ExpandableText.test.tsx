import { render, screen } from '@testing-library/react';
import { ExpandableText } from './ExpandableText';

describe('ExpandableText', () => {
  it('muestra el texto (sin botón si cabe entero)', () => {
    render(
      <ExpandableText>
        <p>Una sinopsis corta.</p>
      </ExpandableText>,
    );
    expect(screen.getByText('Una sinopsis corta.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
