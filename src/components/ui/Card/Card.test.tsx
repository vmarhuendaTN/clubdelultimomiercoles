import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza con la etiqueta indicada', () => {
    render(
      <Card as="article">
        <h3>Próxima sesión</h3>
      </Card>,
    );
    expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading'));
  });
});
