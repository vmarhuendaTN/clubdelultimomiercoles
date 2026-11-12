import { fireEvent, render, screen } from '@testing-library/react';
import { FormularioPropuesta } from './FormularioPropuesta';

const anio = String(new Date().getFullYear());

function rellenar() {
  const escribir = (etiqueta: RegExp, valor: string) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  escribir(/^Nombre/, 'Ana');
  escribir(/^Apellidos/, 'García López');
  escribir(/De qué club eres/, 'Club 1');
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
      /De qué club eres/,
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
      grupo: 'Club 1',
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

  it('las recomendadas rellenan la primera lectura libre y el tintero se envía elegido', () => {
    const onEnviar = vi.fn();
    const opciones = {
      tipo: 'listas' as const,
      opciones: {
        recomendadas: [{ id: 'r1', titulo: 'Circe', autor: 'Madeline Miller' }],
        tintero: [
          { id: 't1', titulo: 'Betty', autor: 'Tiffany McDaniel' },
          { id: 't2', titulo: 'Maniac', autor: 'Benjamín Labatut' },
        ],
      },
    };
    render(<FormularioPropuesta opciones={opciones} onEnviar={onEnviar} enviando={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Proponer Circe, Madeline Miller' }));
    expect(screen.getByLabelText(/^Lectura 1/)).toHaveValue('Circe, Madeline Miller');
    expect(screen.queryByRole('button', { name: /Proponer Circe/ })).toBeNull();

    fireEvent.change(screen.getByLabelText(/Lecturas en el tintero/), { target: { value: 't2' } });
    expect(screen.queryByRole('option', { name: 'Maniac, Benjamín Labatut' })).toBeNull();

    rellenar();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).toHaveBeenCalledWith(
      expect.objectContaining({ tintero: 'Maniac, Benjamín Labatut' }),
    );
  });

  it('si no se cargan las opciones, el formulario sigue funcionando y lo explica', () => {
    render(
      <FormularioPropuesta
        opciones={{ tipo: 'sin_opciones' }}
        onEnviar={vi.fn()}
        enviando={false}
      />,
    );
    expect(screen.getByText(/no podemos cargar el tintero/)).toBeInTheDocument();
  });

  it('con la lista del club envía el id de la persona elegida', () => {
    const onEnviar = vi.fn();
    render(
      <FormularioPropuesta
        onEnviar={onEnviar}
        enviando={false}
        personas={{ tipo: 'lista', personas: [{ id: 'i1', nombre: 'Marta R.', club: '1' }] }}
      />,
    );
    const escribir = (etiqueta: RegExp, valor: string) =>
      fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
    escribir(/¿Quién eres\?/, 'i1');
    escribir(/^Mes/, 'enero');
    escribir(/^Año/, anio);
    escribir(/^Lectura 1/, 'Sinsonte');
    escribir(/^Lectura 2/, 'Circe');
    escribir(/^Lectura 3/, 'Piranesi');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }));
    expect(onEnviar).toHaveBeenCalledWith(
      expect.objectContaining({ inscrita_id: 'i1', nombre: 'Marta', apellidos: '', grupo: '' }),
    );
  });

  it('al elegir mes y año ofrece las recomendadas para esa sesión', () => {
    render(
      <FormularioPropuesta
        onEnviar={vi.fn()}
        enviando={false}
        opciones={{
          tipo: 'listas',
          opciones: {
            recomendadas: [],
            tintero: [],
            porSesion: {
              [`${anio}-01`]: [{ id: 'r1', titulo: 'Circe', autor: 'Madeline Miller' }],
            },
          },
        }}
      />,
    );
    expect(screen.queryByLabelText(/Recomendadas por el club para/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/^Mes/), { target: { value: 'enero' } });
    fireEvent.change(screen.getByLabelText(/^Año/), { target: { value: anio } });
    const select = screen.getByLabelText(
      new RegExp(`Recomendadas por el club para enero de ${anio}`),
    );
    fireEvent.change(select, { target: { value: 'r1' } });
    expect(screen.getByLabelText(/^Lectura 1/)).toHaveValue('Circe, Madeline Miller');
    // Ya elegida: desaparece de las recomendadas de la sesión.
    expect(screen.queryByLabelText(/Recomendadas por el club para/)).toBeNull();
  });
});
