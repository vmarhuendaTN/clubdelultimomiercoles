import { fireEvent, render, screen } from '@testing-library/react';
import { ProposalForm } from './ProposalForm';

const ENLACE = 'https://docs.google.com/forms/d/e/ejemplo/viewform?embedded=true';
const descifrar = vi.hoisted(() => vi.fn());

vi.mock('../../services/enlace-cifrado', () => ({ descifrarEnlace: descifrar }));

describe('ProposalForm', () => {
  beforeEach(() => {
    window.localStorage.clear();
    descifrar.mockReset();
  });

  it('pide el código y no muestra el formulario sin él', () => {
    render(<ProposalForm />);
    expect(screen.getByRole('heading', { name: 'Propón la próxima lectura' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de acceso/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir el formulario' })).toBeDisabled();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('con un código incorrecto avisa del error', async () => {
    descifrar.mockResolvedValue(null);
    render(<ProposalForm />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByText(/El código no es correcto/)).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('con el código correcto muestra el formulario y lo recuerda', async () => {
    descifrar.mockResolvedValue(ENLACE);
    const { unmount } = render(<ProposalForm />);
    fireEvent.change(screen.getByLabelText(/Código de acceso/), { target: { value: 'bien' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir el formulario' }));
    expect(await screen.findByTitle('Propón la próxima lectura')).toHaveAttribute('src', ENLACE);
    expect(
      screen.getByRole('link', { name: 'Abrir el formulario en Google Forms' }),
    ).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/ejemplo/viewform');
    unmount();
    render(<ProposalForm />);
    expect(await screen.findByTitle('Propón la próxima lectura')).toBeInTheDocument();
  });
});
