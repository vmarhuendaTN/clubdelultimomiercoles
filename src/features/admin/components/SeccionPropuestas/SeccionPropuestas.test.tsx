import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { Propuesta } from '../../types';
import { SeccionPropuestas, type VistaPropuestas } from './SeccionPropuestas';

const api = vi.hoisted(() => ({
  archivarSesion: vi.fn(),
  listarVotacion: vi.fn(),
  anadirCandidata: vi.fn(),
  quitarCandidata: vi.fn(),
  abrirVotacion: vi.fn(),
  listarTintero: vi.fn(),
  listarRecomendaciones: vi.fn(),
  guardarRecomendacion: vi.fn(),
  quitarRecomendacion: vi.fn(),
  listarPropuestas: vi.fn(),
  guardarPropuesta: vi.fn(),
  guardarLectura: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const base = { tintero: '', motivo: '', nota_equipo: '', grupo: 'Club 1' };
const PROPUESTAS: Propuesta[] = [
  {
    ...base,
    id: 'p1',
    creado_en: '2026-11-01T10:00:00Z',
    nombre: 'Marta',
    apellidos: 'Ruiz',
    mes: 'enero',
    anio: '2027',
    lectura_1: 'Circe, Madeline Miller',
    lectura_2: 'Tea Rooms',
    lectura_3: 'Betty',
    tintero: 'Piranesi, Susanna Clarke',
    estado: 'nueva',
  },
  {
    ...base,
    id: 'p2',
    creado_en: '2026-11-02T10:00:00Z',
    nombre: 'Luis',
    apellidos: 'Gómez',
    mes: 'enero',
    anio: '2027',
    lectura_1: 'Circe',
    lectura_2: 'Maniac',
    lectura_3: 'Reunión',
    estado: 'nueva',
  },
  {
    ...base,
    id: 'p3',
    creado_en: '2026-09-01T10:00:00Z',
    nombre: 'Ana',
    apellidos: 'Sanz',
    mes: 'noviembre',
    anio: '2026',
    lectura_1: 'Maniac',
    lectura_2: 'Hamnet',
    lectura_3: 'Klara y el sol',
    estado: 'descartada',
  },
];

const verSesion = vi.fn();
const elemento = (vista: VistaPropuestas) => (
  <ToastProvider>
    <SeccionPropuestas
      sesion="s1"
      esAdmin
      alCaducar={vi.fn()}
      vista={vista}
      onVerSesion={verSesion}
    />
  </ToastProvider>
);
let rerender: (ui: React.ReactElement) => void = () => undefined;
const pintar = () => {
  ({ rerender } = render(elemento('resumen')));
};
/** El menú del panel cambia la vista (aquí, volviendo a pintar con otra). */
const ir = (vista: VistaPropuestas) => rerender(elemento(vista));

describe('SeccionPropuestas', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarPropuestas.mockResolvedValue({ ok: true, propuestas: PROPUESTAS });
    api.listarTintero.mockResolvedValue({ ok: true, tintero: [] });
    api.listarRecomendaciones.mockResolvedValue({ ok: true, recomendaciones: [] });
    api.listarVotacion.mockResolvedValue({ ok: true, candidatas: [], votos: [] });
  });

  it('abre en la sesión más reciente con sus cifras y la clasificación', async () => {
    pintar();
    expect(await screen.findByLabelText('Sesión')).toHaveValue('2027-01');
    expect(screen.getByText('Personas', { selector: 'span' }).previousSibling).toHaveTextContent(
      '2',
    );
    expect(screen.getByText('Coincidencias').previousSibling).toHaveTextContent('1');
    const ranking = screen.getByRole('heading', { name: 'Los más propuestos' }).closest('section')!;
    const primero = within(ranking).getAllByRole('listitem')[0]!;
    expect(primero).toHaveTextContent('Circe');
    expect(primero).toHaveTextContent('2 personas · 6 puntos');
    expect(screen.getByText('También en Noviembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Piranesi, Susanna Clarke')).toBeInTheDocument();
  });

  it('al cambiar de sesión cambian las cifras', async () => {
    pintar();
    fireEvent.change(await screen.findByLabelText('Sesión'), { target: { value: '2026-11' } });
    expect(screen.getByText('Personas', { selector: 'span' }).previousSibling).toHaveTextContent(
      '1',
    );
  });

  it('en Personas se cambia el estado y se guarda en la hoja', async () => {
    api.guardarPropuesta.mockResolvedValue({ ok: true, propuesta: {} });
    pintar();
    await screen.findByLabelText('Sesión');
    ir('personas');
    fireEvent.change(screen.getByLabelText('Estado de la propuesta de Marta Ruiz'), {
      target: { value: 'en_votacion' },
    });
    expect(await screen.findByText('Propuesta de Marta Ruiz: en votación.')).toBeInTheDocument();
    expect(api.guardarPropuesta).toHaveBeenCalledWith('s1', {
      id: 'p1',
      estado: 'en_votacion',
      nota_equipo: '',
    });
  });

  it('desde la clasificación se pasa un libro a Lecturas con título y autor', async () => {
    pintar();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Añadir «Circe, Madeline Miller» a lecturas' }),
    );
    const hoja = screen.getByRole('dialog');
    expect(within(hoja).getByLabelText(/^Título/)).toHaveValue('Circe');
    expect(within(hoja).getByLabelText(/^Autor/)).toHaveValue('Madeline Miller');
    expect(within(hoja).getByLabelText('Estado')).toHaveValue('proximo');
  });

  it('copia el resumen para compartirlo', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Copiar resumen' }));
    expect(await screen.findByText(/Resumen copiado/)).toBeInTheDocument();
    expect(writeText.mock.calls[0]?.[0]).toMatch(/^Propuestas · Enero de 2027/);
  });

  it('el tintero tiene su propia vista', async () => {
    pintar();
    await screen.findByLabelText('Sesión');
    ir('tintero');
    expect(await screen.findByRole('heading', { name: 'Lecturas pendientes' })).toBeInTheDocument();
  });

  it('sin propuestas lo dice', async () => {
    api.listarPropuestas.mockResolvedValue({ ok: true, propuestas: [] });
    pintar();
    expect(await screen.findByText(/Todavía no hay lecturas propuestas/)).toBeInTheDocument();
  });

  it('una admin lleva un libro a la votación y la abre', async () => {
    const candidata = {
      id: 'c1',
      sesion: '2027-01',
      titulo: 'Circe',
      autor: 'Madeline Miller',
      abierta: 'no',
    };
    api.anadirCandidata.mockResolvedValue({ ok: true, candidata });
    api.abrirVotacion.mockResolvedValue({ ok: true });
    api.listarVotacion
      .mockResolvedValueOnce({ ok: true, candidatas: [], votos: [] })
      .mockResolvedValue({ ok: true, candidatas: [candidata], votos: [] });
    pintar();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Llevar «Circe, Madeline Miller» a la votación' }),
    );
    expect(await screen.findByText(/entra en la votación de enero de 2027/)).toBeInTheDocument();
    expect(api.anadirCandidata).toHaveBeenCalledWith('s1', {
      sesion: '2027-01',
      titulo: 'Circe',
      autor: 'Madeline Miller',
    });
    expect(
      await screen.findByRole('button', { name: 'Sacar «Circe, Madeline Miller» de la votación' }),
    ).toBeInTheDocument();

    ir('votacion');
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir votación' }));
    expect(await screen.findByText(/el club ya puede puntuar/)).toBeInTheDocument();
    expect(api.abrirVotacion).toHaveBeenCalledWith('s1', { sesion: '2027-01', abierta: true });
  });

  it('archivar una sesión la saca del selector y la lleva al archivo', async () => {
    api.archivarSesion.mockResolvedValue({ ok: true });
    pintar();
    expect(await screen.findByLabelText('Sesión')).toHaveValue('2027-01');
    api.listarPropuestas.mockResolvedValue({
      ok: true,
      propuestas: PROPUESTAS.map((p) => (p.mes === 'enero' ? { ...p, archivada: 'si' } : p)),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Archivar sesión' }));
    expect(await screen.findByText(/Enero de 2027 archivada/)).toBeInTheDocument();
    expect(api.archivarSesion).toHaveBeenCalledWith('s1', { sesion: '2027-01', archivar: true });
    expect(screen.getByLabelText('Sesión')).toHaveValue('2026-11');

    ir('archivo');
    const archivo = screen.getByRole('region', { name: /^2027/ });
    expect(within(archivo).getByRole('heading', { name: 'Enero' })).toBeInTheDocument();
    fireEvent.click(within(archivo).getByRole('button', { name: 'Ver Enero de 2027' }));
    expect(verSesion).toHaveBeenCalled();
    ir('resumen'); // el panel pasa a Propuestas
    expect(screen.getByLabelText('Sesión')).toHaveValue('2027-01');
    expect(screen.getByRole('note')).toHaveTextContent('está archivada');
  });
});
