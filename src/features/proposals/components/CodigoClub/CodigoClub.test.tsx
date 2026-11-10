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
    comprobar.mockResolvedValue(false);
    const onCorrecto = vi.fn();
    render(<CodigoClub onCorrecto={onCorrecto} />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByText(/El código no es correcto/)).toBeInTheDocument();
    expect(onCorrecto).not.toHaveBeenCalled();
  });

  it('con el código correcto lo devuelve sin espacios', async () => {
    comprobar.mockResolvedValue(true);
    const onCorrecto = vi.fn();
    render(<CodigoClub onCorrecto={onCorrecto} />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: ' bien ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    await vi.waitFor(() => expect(onCorrecto).toHaveBeenCalledWith('bien'));
  });
});
