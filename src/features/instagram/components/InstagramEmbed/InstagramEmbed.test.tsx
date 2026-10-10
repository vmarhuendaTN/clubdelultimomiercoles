import { render, screen } from '@testing-library/react';
import { InstagramEmbed } from './InstagramEmbed';

describe('InstagramEmbed', () => {
  it('muestra el perfil incrustado y el enlace a la cuenta', () => {
    render(<InstagramEmbed />);
    expect(screen.getByTitle('Publicaciones de @elultimomiercoles en Instagram')).toHaveAttribute(
      'src',
      'https://www.instagram.com/elultimomiercoles/embed',
    );
    expect(screen.getByRole('link', { name: 'Ver en Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/elultimomiercoles/',
    );
  });
});
