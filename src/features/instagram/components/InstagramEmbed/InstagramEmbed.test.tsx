import { render, screen, waitFor } from '@testing-library/react';
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

describe('InstagramEmbed: altura', () => {
  it('se ajusta a la altura que comunica Instagram', async () => {
    render(<InstagramEmbed />);
    const iframe = screen.getByTitle('Publicaciones de @elultimomiercoles en Instagram');
    expect(iframe).not.toHaveAttribute('height');
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://www.instagram.com',
        data: JSON.stringify({ type: 'MEASURE', details: { height: 702 } }),
      }),
    );
    await waitFor(() => expect(iframe).toHaveAttribute('height', '702'));
  });
});
