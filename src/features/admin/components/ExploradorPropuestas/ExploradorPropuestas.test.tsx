import { fireEvent, render, screen } from '@testing-library/react';
import type { Propuesta } from '../../types';
import { resumir } from '../../services/resumen-propuestas';
import { ExploradorPropuestas } from './ExploradorPropuestas';

const base: Omit<
  Propuesta,
  'id' | 'nombre' | 'apellidos' | 'lectura_1' | 'lectura_2' | 'lectura_3'
> = {
  creado_en: '2026-11-01T10:00:00Z',
  grupo: 'Miércoles',
  mes: 'enero',
  anio: '2027',
  tintero: '',
  motivo: '',
  estado: 'nueva',
  nota_equipo: '',
};
const PROPUESTAS: Propuesta[] = [
  {
    ...base,
    id: '1',
    nombre: 'Ana',
    apellidos: 'García',
    lectura_1: 'Circe',
    lectura_2: 'Betty',
    lectura_3: 'Maniac',
  },
  {
    ...base,
    id: '2',
    nombre: 'Luis',
    apellidos: 'Pérez',
    lectura_1: 'Circe',
    lectura_2: 'Hamnet',
    lectura_3: 'Reunión',
  },
  {
    ...base,
    id: '3',
    nombre: 'Marta',
    apellidos: 'Ruiz',
    mes: 'noviembre',
    anio: '2026',
    lectura_1: 'Betty',
    lectura_2: 'X',
    lectura_3: 'Y',
  },
];
const RESUMEN = resumir(PROPUESTAS, '2027-01');

const pintar = () => render(<ExploradorPropuestas resumen={RESUMEN} onAnadir={vi.fn()} />);
const titulos = () => screen.queryAllByRole('heading', { level: 4 }).map((h) => h.textContent);

describe('ExploradorPropuestas', () => {
  it('las cifras filtran: coincidencias y ya propuestos antes', () => {
    pintar();
    expect(titulos()).toEqual(['Circe', 'Betty', 'Hamnet', 'Maniac', 'Reunión']);
    fireEvent.click(screen.getByRole('button', { name: /Coincidencias/ }));
    expect(screen.getByRole('button', { name: /Coincidencias/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(titulos()).toEqual(['Circe']);
    fireEvent.click(screen.getByRole('button', { name: /Ya propuestos antes/ }));
    expect(titulos()).toEqual(['Betty']);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    expect(titulos()).toHaveLength(5);
  });

  it('el buscador encuentra libros y personas', () => {
    pintar();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'hamnet' } });
    expect(titulos()).toEqual(['Hamnet']);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pérez' } });
    expect(titulos()).toEqual(['Circe', 'Hamnet', 'Reunión']);
  });

  it('agrupa por persona y al pulsar un nombre muestra lo suyo', () => {
    pintar();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ver lo que propuso Luis Pérez' })[0]!);
    expect(screen.getByRole('button', { name: /Personas/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(titulos()).toEqual(['Luis Pérez']);
    expect(screen.getByText('+1 persona')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver «Hamnet» en la clasificación' }));
    expect(titulos()).toEqual(['Hamnet']);
  });
});
