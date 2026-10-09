import { render, screen } from '@testing-library/react';
import { PrivacyPage } from './PrivacyPage';

describe('PrivacyPage', () => {
  it('incluye responsable, finalidades, derechos y la AEPD', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Privacidad' })).toBeInTheDocument();
    for (const titulo of [
      '1. Quién es el responsable',
      '2. Qué datos tratamos, para qué y con qué base legal',
      '3. Cuánto tiempo los guardamos',
      '4. Con quién se comparten',
      '5. Cookies y almacenamiento en tu navegador',
      '6. Tus derechos',
      '7. Menores',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'www.aepd.es' })).toHaveAttribute(
      'href',
      'https://www.aepd.es',
    );
    expect(
      screen.getAllByRole('link', { name: 'elultimomiercolesclub@gmail.com' })[0],
    ).toHaveAttribute('href', 'mailto:elultimomiercolesclub@gmail.com');
  });
});
