import { fireEvent, render, screen } from '@testing-library/react';
import { FormularioPropuesta } from './FormularioPropuesta';

const anio = String(new Date().getFullYear());

function rellenar() {
  const escribir = (etiqueta: RegExp, valor: string) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  escribir(/^Nombre/, 'Ana');
  escribir(/^Apellidos/, 'García López');
  escribir(/De qué grupo eres/, 'Miércoles');
  escribir(/^Mes/, 'enero');
  escribir(/^Año/, anio);
  escribir(/^Lectura 1/, 'Sinsonte, Walter Tevis');
  escribir(/^Lectura 2/, 'Tea Rooms, Luisa Carnés');
  escribir(/^Lectura 3/, 'Circe, Madeline Miller');
}

describe('FormularioPropuesta', () => {
  it('tiene las mismas preguntas que el Google Form', () => {
    render(<FormularioPropuesta onEnviar={vi.fn()} enviando={false} />);
    for (const etiqueta of [
      /^Nombre/,
      /^Apellidos/,
      /De qué grupo eres/,
      /^Mes/,
      /^Año/,
      /^Lectura 1/,
      /^Lectura 2/,
      /^Lectura 3/,
      /Lecturas en el tintero/,
      /Por qué te interesan/,
    ]) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('option', { name: 'Enero' })).toHaveLength(1);
  });

  it('pide los campos obligatorios y explica cuáles faltan', () => {
    const onEnviar = vi.fn();
    render(<FormularioPropuesta onEnviar={onEnviar} enviando={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Elige el mes.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu tercera lectura.')).toBeInTheDocument();
    expect(screen.queryByText(/tintero/i, { selector: 'p[aria-live]' })).toBeNull();
  });

  it('envía todo lo escrito (el tintero y el porqué son opcionales)', () => {
    const onEnviar = vi.fn();
    render(<FormularioPropuesta onEnviar={onEnviar} enviando={false} />);
    rellenar();
    fireEvent.change(screen.getByLabelText(/Por qué te interesan/), {
      target: { value: 'Porque sí.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellidos: 'García López',
      grupo: 'Miércoles',
      mes: 'enero',
      anio,
      lectura_1: 'Sinsonte, Walter Tevis',
      lectura_2: 'Tea Rooms, Luisa Carnés',
      lectura_3: 'Circe, Madeline Miller',
      tintero: '',
      motivo: 'Porque sí.',
    });
  });

  it('muestra el error de envío y bloquea el botón mientras envía', () => {
    render(<FormularioPropuesta onEnviar={vi.fn()} enviando error="Sin conexión." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión.');
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });
});
