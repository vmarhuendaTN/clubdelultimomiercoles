import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { EstadoPersonas } from '../../hooks/use-personas-club';
import { QuienEres, validarQuien, type DatosQuien } from './QuienEres';

const LISTA: EstadoPersonas = {
  tipo: 'lista',
  personas: [
    { id: 'i1', nombre: 'Marta R.', club: '1' },
    { id: 'i2', nombre: 'Luis P.', club: '2' },
  ],
};
const VACIO: DatosQuien = { persona: '', nombre: '', apellidos: '', grupo: '' };

function Prueba({ personas }: { personas: EstadoPersonas }) {
  const [valor, setValor] = useState(VACIO);
  return (
    <QuienEres
      personas={personas}
      valor={valor}
      errores={{}}
      conClub
      onCambiar={(c, v) => setValor((q) => ({ ...q, [c]: v }))}
    />
  );
}

describe('QuienEres', () => {
  beforeEach(() => window.localStorage.clear());

  it('con la lista, se elige el nombre y no hay que escribirlo', () => {
    render(<Prueba personas={LISTA} />);
    const select = screen.getByLabelText(/¿Quién eres\?/);
    expect(screen.getByRole('option', { name: 'Marta R. · Club 1' })).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'i1' } });
    expect(screen.queryByLabelText(/^Nombre/)).toBeNull();
  });

  it('«No estoy en la lista» pide nombre, apellidos y club', () => {
    render(<Prueba personas={LISTA} />);
    fireEvent.change(screen.getByLabelText(/¿Quién eres\?/), { target: { value: 'otra' } });
    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Apellidos/)).toBeInTheDocument();
    expect(screen.getByLabelText(/De qué club eres/)).toBeInTheDocument();
  });

  it('recuerda quién eras en este navegador', () => {
    window.localStorage.setItem('club:yo', 'i2');
    render(<Prueba personas={LISTA} />);
    expect(screen.getByLabelText(/¿Quién eres\?/)).toHaveValue('i2');
  });

  it('sin lista, nombre y apellidos a mano', () => {
    render(<Prueba personas={{ tipo: 'sin_lista' }} />);
    expect(screen.queryByLabelText(/¿Quién eres\?/)).toBeNull();
    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
  });

  it('valida según lo elegido', () => {
    expect(validarQuien(VACIO, LISTA, true)).toEqual({ persona: 'Elige tu nombre.' });
    expect(validarQuien({ ...VACIO, persona: 'i1' }, LISTA, true)).toEqual({});
    expect(Object.keys(validarQuien({ ...VACIO, persona: 'otra' }, LISTA, true))).toEqual([
      'nombre',
      'apellidos',
      'grupo',
    ]);
  });
});
