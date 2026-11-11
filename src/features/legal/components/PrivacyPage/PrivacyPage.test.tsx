import { render, screen } from '@testing-library/react';
import { PrivacyPage } from './PrivacyPage';

describe('PrivacyPage', () => {
  it('incluye responsable, datos, plazos, proveedores, cookies, derechos y la AEPD', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Privacidad' })).toBeInTheDocument();
    for (const titulo of [
      '1. Responsable',
      '2. Qué datos tratamos y para qué',
      '3. Cuánto tiempo los guardamos',
      '4. Proveedores',
      '5. Cookies y almacenamiento en tu navegador',
      '6. Tus derechos',
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
