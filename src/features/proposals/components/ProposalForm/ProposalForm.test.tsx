import { fireEvent, render, screen } from '@testing-library/react';
import { ProposalForm } from './ProposalForm';

const comprobar = vi.hoisted(() => vi.fn());
const enviar = vi.hoisted(() => vi.fn());
vi.mock('../../services/comprobar-codigo', () => ({ comprobarCodigo: comprobar }));
vi.mock('../../services/enviar-propuesta', () => ({ enviarPropuesta: enviar }));

const ANIO = String(new Date().getFullYear());

function rellenar() {
  const escribir = (etiqueta: RegExp, valor: string) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  escribir(/^Nombre/, 'Ana');
  escribir(/^Apellidos/, 'García');
  escribir(/De qué grupo eres/, 'Miércoles');
  escribir(/^Mes/, 'enero');
  escribir(/^Año/, ANIO);
  escribir(/^Lectura 1/, 'Sinsonte');
  escribir(/^Lectura 2/, 'Circe');
  escribir(/^Lectura 3/, 'Piranesi');
  fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
}

describe('ProposalForm', () => {
  beforeEach(() => {
    window.localStorage.clear();
    comprobar.mockReset();
    enviar.mockReset();
  });

  it('pide el código y no muestra el formulario sin él', () => {
    render(<ProposalForm />);
    expect(screen.getByRole('heading', { name: 'Propón la próxima lectura' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de acceso/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Apellidos/)).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('con el código correcto muestra el formulario propio y lo recuerda', async () => {
    comprobar.mockResolvedValue({ ok: true });
    const { unmount } = render(<ProposalForm />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'bien' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByLabelText(/^Apellidos/)).toBeInTheDocument();
    unmount();
    render(<ProposalForm />);
    expect(await screen.findByLabelText(/^Apellidos/)).toBeInTheDocument();
  });

  it('envía la propuesta con el código y da las gracias', async () => {
    window.localStorage.setItem('club:codigo-propuestas', 'bien');
    enviar.mockResolvedValue({ ok: true, id: 'p1' });
    render(<ProposalForm />);
    await screen.findByLabelText(/^Apellidos/);
    rellenar();
    expect(await screen.findByText(/¡Gracias, Ana!/)).toHaveTextContent(`enero de ${ANIO}`);
    expect(enviar).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Ana', lectura_1: 'Sinsonte', lectura_3: 'Piranesi' }),
      'bien',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Proponer otra' }));
    expect(screen.getByLabelText(/^Lectura 1/)).toHaveValue('');
  });

  it('si el código cambió, lo olvida y lo vuelve a pedir', async () => {
    window.localStorage.setItem('club:codigo-propuestas', 'viejo');
    enviar.mockResolvedValue({ ok: false, error: 'codigo_incorrecto' });
    render(<ProposalForm />);
    await screen.findByLabelText(/^Apellidos/);
    rellenar();
    expect(await screen.findByText(/código del club ha cambiado/)).toBeInTheDocument();
    expect(window.localStorage.getItem('club:codigo-propuestas')).toBeNull();
  });

  it('si falla la conexión, lo explica y conserva lo escrito', async () => {
    window.localStorage.setItem('club:codigo-propuestas', 'bien');
    enviar.mockResolvedValue({ ok: false, error: 'red' });
    render(<ProposalForm />);
    await screen.findByLabelText(/^Apellidos/);
    rellenar();
    expect(await screen.findByRole('alert')).toHaveTextContent(/No hemos podido conectar/);
    expect(screen.getByLabelText(/^Lectura 1/)).toHaveValue('Sinsonte');
  });
});
