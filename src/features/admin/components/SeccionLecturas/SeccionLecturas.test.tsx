import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { LecturaHoja } from '../../types';
import { SeccionLecturas } from './SeccionLecturas';

const api = vi.hoisted(() => ({ listarLecturas: vi.fn(), guardarLectura: vi.fn() }));
vi.mock('../../services/api', () => api);

const base: Omit<LecturaHoja, 'id' | 'titulo' | 'autor' | 'estado'> = {
  orden: '',
  fecha_sesion: '',
  isbn: '',
  google_books_id: '',
  portada_manual: '',
  descripcion_manual: '',
  nota_club: '',
  visible: 'si',
  revisar: '',
};
const LECTURAS: LecturaHoja[] = [
  {
    ...base,
    id: '1',
    titulo: 'Los astronautas',
    autor: 'Laura Ferrero',
    estado: 'leido',
    orden: '2',
  },
  { ...base, id: '2', titulo: 'Sinsonte', autor: 'Walter Tevis', estado: 'proximo' },
  {
    ...base,
    id: '3',
    titulo: 'Leviatán',
    autor: 'Paul Auster',
    estado: 'leido',
    orden: '5',
    visible: 'no',
  },
];

const pintar = () =>
  render(
    <ToastProvider>
      <SeccionLecturas sesion="s1" alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('SeccionLecturas', () => {
  beforeEach(() => {
    api.listarLecturas.mockReset().mockResolvedValue({ ok: true, lecturas: LECTURAS });
  });

  it('lista la próxima primero y después los leídos del más reciente al más antiguo', async () => {
    pintar();
    const filas = await screen.findAllByRole('button', { name: /^Editar/ });
    expect(filas.map((f) => f.getAttribute('aria-label'))).toEqual([
      'Editar «Sinsonte», de Walter Tevis',
      'Editar «Leviatán», de Paul Auster',
      'Editar «Los astronautas», de Laura Ferrero',
    ]);
    expect(screen.getByText('3 lecturas')).toBeInTheDocument();
  });

  it('busca sin tildes y filtra las ocultas', async () => {
    pintar();
    await screen.findByText('Sinsonte');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'leviatan' } });
    expect(screen.getByText('1 lectura')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Mostrar'), { target: { value: 'ocultas' } });
    const lista = screen.getByRole('list');
    expect(within(lista).getAllByRole('listitem')).toHaveLength(1);
    expect(within(lista).getByText('Oculta')).toBeInTheDocument();
  });

  it('abre el editor con «Añadir lectura» y al pulsar una fila', async () => {
    pintar();
    await screen.findByText('Sinsonte');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir lectura' }));
    expect(screen.getByRole('heading', { name: 'Nueva lectura' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: /Editar «Sinsonte»/ }));
    expect(screen.getByRole('heading', { name: 'Editar lectura' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Título/)).toHaveValue('Sinsonte');
  });

  it('si falla la carga deja reintentar', async () => {
    api.listarLecturas.mockResolvedValueOnce({ ok: false, error: 'red' });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Sinsonte')).toBeInTheDocument();
  });
});
