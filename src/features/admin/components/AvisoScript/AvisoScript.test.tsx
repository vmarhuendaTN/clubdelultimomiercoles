import { render, screen } from '@testing-library/react';
import { AvisoScript } from './AvisoScript';

const api = vi.hoisted(() => ({ estadoScript: vi.fn(), diagnostico: vi.fn() }));
vi.mock('../../services/api', () => api);

describe('AvisoScript', () => {
  beforeEach(() => Object.values(api).forEach((f) => f.mockReset()));

  it('avisa si la hoja tiene un script antiguo', async () => {
    api.estadoScript.mockResolvedValue({ ok: true, version: 6 });
    render(<AvisoScript sesion="s1" esAdmin />);
    expect(await screen.findByText(/versión 6 del script/)).toBeInTheDocument();
    expect(api.diagnostico).not.toHaveBeenCalled();
  });

  it('a las administradoras les dice qué falta y el error de Google Libros', async () => {
    api.estadoScript.mockResolvedValue({ ok: true, version: 12 });
    api.diagnostico.mockResolvedValue({
      ok: true,
      version: 12,
      faltan: ['CODIGO_CLUB'],
      libros: 'La clave GOOGLE_BOOKS_API_KEY del script no es válida.',
    });
    render(<AvisoScript sesion="s1" esAdmin />);
    expect(await screen.findByText('CODIGO_CLUB')).toBeInTheDocument();
    expect(screen.getByText(/no es válida/)).toBeInTheDocument();
  });

  it('si todo está bien no se ve', async () => {
    api.estadoScript.mockResolvedValue({ ok: true, version: 12 });
    api.diagnostico.mockResolvedValue({ ok: true, version: 12, faltan: [], libros: 'ok' });
    const { container } = render(<AvisoScript sesion="s1" esAdmin />);
    await vi.waitFor(() => expect(api.diagnostico).toHaveBeenCalledWith('s1'));
    expect(container).toBeEmptyDOMElement();
  });
});
