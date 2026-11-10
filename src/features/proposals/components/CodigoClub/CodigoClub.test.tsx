import { fireEvent, render, screen } from '@testing-library/react';
import { CodigoClub } from './CodigoClub';

const comprobar = vi.hoisted(() => vi.fn());
vi.mock('../../services/comprobar-codigo', () => ({ comprobarCodigo: comprobar }));

describe('CodigoClub', () => {
  beforeEach(() => comprobar.mockReset());

  it('no deja enviar sin código', () => {
    render(<CodigoClub onCorrecto={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Abrir el formulario' })).toBeDisabled();
  });

  it('con un código incorrecto avisa', async () => {
    comprobar.mockResolvedValue({ ok: false, error: 'codigo_incorrecto' });
    const onCorrecto = vi.fn();
    render(<CodigoClub onCorrecto={onCorrecto} />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByText(/El código no es correcto/)).toBeInTheDocument();
    expect(onCorrecto).not.toHaveBeenCalled();
  });

  it('con el código correcto lo devuelve sin espacios', async () => {
    comprobar.mockResolvedValue({ ok: true });
    const onCorrecto = vi.fn();
    render(<CodigoClub onCorrecto={onCorrecto} />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: ' bien ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    await vi.waitFor(() => expect(onCorrecto).toHaveBeenCalledWith('bien'));
  });

  it('si no hay conexión lo dice, en vez de dar el código por malo', async () => {
    comprobar.mockResolvedValue({ ok: false, error: 'red' });
    render(<CodigoClub onCorrecto={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByText(/No hemos podido conectar/)).toBeInTheDocument();
  });
});
