import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui';
import { ReviewsSection } from './ReviewsSection';

const servicios = vi.hoisted(() => ({
  listarValoraciones: vi.fn(),
  miValoracion: vi.fn(),
  guardarValoracion: vi.fn(),
  borrarValoracion: vi.fn(),
}));
const sesion = vi.hoisted(() => ({ actual: null as unknown }));
const auth = vi.hoisted(() => ({ entrarConGoogle: vi.fn(), salir: vi.fn() }));

vi.mock('../../services/reviews', () => servicios);
vi.mock('@/features/auth', () => auth);
vi.mock('@/lib/supabase', () => ({ supabaseConfigurado: () => true }));
vi.mock('@/hooks/use-session', () => ({
  useSession: () => ({ session: sesion.actual, cargando: false }),
}));

const opinion = {
  id: '1',
  bookSlug: 'circe',
  estrellas: 4,
  opinion: 'Precioso.',
  autorNombre: 'Ana G.',
  creadoEn: '2025-02-01T10:00:00Z',
  actualizadoEn: '2025-02-01T10:00:00Z',
};

const renderizar = () =>
  render(
    <ToastProvider>
      <ReviewsSection slug="circe" titulo="Circe" />
    </ToastProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  sesion.actual = null;
  servicios.listarValoraciones.mockResolvedValue([opinion]);
  servicios.miValoracion.mockResolvedValue(null);
  servicios.guardarValoracion.mockResolvedValue(undefined);
});

describe('ReviewsSection', () => {
  it('sin sesión muestra la media, las opiniones y el botón de Google', async () => {
    renderizar();
    expect(await screen.findByText('4 · 1 valoración')).toBeInTheDocument();
    expect(screen.getByText('Precioso.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar con Google para valorar' }));
    expect(auth.entrarConGoogle).toHaveBeenCalled();
    expect(screen.queryByRole('group', { name: /Tu valoración/ })).not.toBeInTheDocument();
  });

  it('con sesión permite valorar y avisa del nombre público', async () => {
    sesion.actual = {
      user: { id: 'u1', user_metadata: { full_name: 'Victoria Marhuenda Isamat' } },
    };
    renderizar();
    expect(await screen.findByText(/Se publicará como «Victoria M\.»/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '5 estrellas' }));
    await userEvent.type(screen.getByRole('textbox', { name: /Tu opinión/ }), 'Una maravilla');
    await userEvent.click(screen.getByRole('button', { name: 'Publicar valoración' }));
    await waitFor(() =>
      expect(servicios.guardarValoracion).toHaveBeenCalledWith('circe', 5, 'Una maravilla'),
    );
    expect(await screen.findByText('¡Gracias! Tu valoración está publicada.')).toBeInTheDocument();
  });

  it('no publica sin estrellas', async () => {
    sesion.actual = { user: { id: 'u1', user_metadata: {} } };
    renderizar();
    await userEvent.click(await screen.findByRole('button', { name: 'Publicar valoración' }));
    expect(servicios.guardarValoracion).not.toHaveBeenCalled();
    expect(await screen.findByText('Elige de 1 a 5 estrellas.')).toBeInTheDocument();
  });

  it('si ya valoró, carga su valoración y permite borrarla', async () => {
    sesion.actual = { user: { id: 'u1', user_metadata: {} } };
    servicios.miValoracion.mockResolvedValue(opinion);
    renderizar();
    expect(
      await screen.findByRole('button', { name: 'Actualizar valoración' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '4 estrellas' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Borrar mi valoración' }));
    expect(servicios.borrarValoracion).toHaveBeenCalledWith('circe', 'u1');
  });

  it('si falla la carga ofrece reintentar', async () => {
    servicios.listarValoraciones.mockRejectedValueOnce(
      new Error('No se pudieron cargar las valoraciones.'),
    );
    renderizar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Precioso.')).toBeInTheDocument();
  });
});
