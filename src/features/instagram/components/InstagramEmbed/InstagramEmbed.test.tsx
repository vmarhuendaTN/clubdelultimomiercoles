import { fireEvent, render, screen } from '@testing-library/react';
import { InstagramEmbed } from './InstagramEmbed';

const TITULO = 'Publicaciones de @elultimomiercoles en Instagram';

describe('InstagramEmbed', () => {
  beforeEach(() => window.localStorage.clear());

  it('no carga Instagram hasta que se pide', () => {
    render(<InstagramEmbed />);
    expect(screen.queryByTitle(TITULO)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver en Instagram' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Más información' })).toHaveAttribute(
      'href',
      '/privacidad/',
    );
  });

  it('al pedirlo muestra el perfil incrustado y lo recuerda', async () => {
    const { unmount } = render(<InstagramEmbed />);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar publicaciones' }));
    expect(screen.getByTitle(TITULO)).toHaveAttribute(
      'src',
      'https://www.instagram.com/elultimomiercoles/embed',
    );
    unmount();
    render(<InstagramEmbed />);
    expect(await screen.findByTitle(TITULO)).toBeInTheDocument();
  });
});
