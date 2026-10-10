import { fireEvent, render, screen } from '@testing-library/react';
import { JoinForm } from './JoinForm';

function rellenar(etiqueta: RegExp, valor: string) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

describe('JoinForm', () => {
  const original = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('marca los campos obligatorios que faltan y no abre el correo', () => {
    render(<JoinForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Preparar el email' }));
    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Escribe un teléfono de contacto válido.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre/)).toHaveFocus();
    expect(window.location.href).toBe('');
  });

  it('con los datos completos abre el correo con la solicitud', () => {
    render(<JoinForm />);
    rellenar(/^Nombre/, 'Ana');
    rellenar(/^Apellidos/, 'García');
    rellenar(/^Teléfono/, '600123456');
    rellenar(/^Cuéntanos/, 'Leo de todo.');
    rellenar(/de parte de alguien/, 'Inés');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar el email' }));
    expect(window.location.href).toMatch(/^mailto:elultimomiercolesclub@gmail\.com\?subject=/);
    expect(decodeURIComponent(window.location.href)).toContain('De parte de: Inés');
    expect(screen.getByRole('status')).toHaveTextContent('solo falta enviarla');
  });
});
