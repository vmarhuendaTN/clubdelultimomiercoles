import { fireEvent, render, screen } from '@testing-library/react';
import type { Propuesta } from '../../types';
import { ListaProponentes } from './ListaProponentes';

const base: Propuesta = {
  id: 'p1',
  creado_en: '2026-11-01T10:00:00Z',
  nombre: 'Marta',
  apellidos: 'Ruiz',
  grupo: 'Miércoles',
  mes: 'enero',
  anio: '2027',
  lectura_1: 'Circe',
  lectura_2: 'Tea Rooms',
  lectura_3: 'Betty',
  tintero: 'Piranesi, Susanna Clarke; Hamnet',
  motivo: 'Porque sí.',
  estado: 'nueva',
  nota_equipo: '',
};

function pintar(props: Partial<Parameters<typeof ListaProponentes>[0]> = {}) {
  const onCambiarEstado = vi.fn();
  const onAnadir = vi.fn();
  render(
    <ListaProponentes
      propuestas={[base, { ...base, id: 'p2', nombre: 'Luis', estado: 'descartada' }]}
      repetidos={['Marta Ruiz']}
      guardando={null}
      onCambiarEstado={onCambiarEstado}
      onAnadir={onAnadir}
      {...props}
    />,
  );
  return { onCambiarEstado, onAnadir };
}

describe('ListaProponentes', () => {
  it('muestra quién propone, para qué sesión, su tintero y si envió varias', () => {
    pintar();
    expect(screen.getByRole('heading', { name: 'Marta Ruiz' })).toBeInTheDocument();
    expect(screen.getAllByText(/Grupo Miércoles · para enero de 2027/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Piranesi, Susanna Clarke · Hamnet/)[0]).toBeInTheDocument();
    expect(screen.getByText('Envió varias')).toBeInTheDocument();
  });

  it('filtra por estado', () => {
    pintar();
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
      target: { value: 'descartada' },
    });
    expect(screen.getByText('1 propuesta')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Marta Ruiz' })).toBeNull();
  });

  it('cambia el estado y pasa una lectura al editor', () => {
    const { onCambiarEstado, onAnadir } = pintar();
    fireEvent.change(screen.getByLabelText('Estado de la propuesta de Marta Ruiz'), {
      target: { value: 'en_votacion' },
    });
    expect(onCambiarEstado).toHaveBeenCalledWith(base, 'en_votacion');
    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir «Tea Rooms» a lecturas' })[0]!);
    expect(onAnadir).toHaveBeenCalledWith('Tea Rooms', base);
  });

  it('deja eliminar una propuesta enviada por error', () => {
    const onEliminar = vi.fn();
    pintar({ onEliminar });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar la propuesta de Marta Ruiz' }));
    expect(onEliminar).toHaveBeenCalledWith(base);
  });
});
