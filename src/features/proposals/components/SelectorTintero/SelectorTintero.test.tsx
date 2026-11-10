import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { LibroOpcion } from '../../services/opciones';
import { SelectorTintero } from './SelectorTintero';

const CIRCE = { id: 'c', titulo: 'Circe', autor: 'Madeline Miller' };
const BETTY = { id: 'b', titulo: 'Betty', autor: 'Tiffany McDaniel' };

function Prueba() {
  const [elegidas, setElegidas] = useState<LibroOpcion[]>([]);
  const disponibles = [CIRCE, BETTY].filter((l) => !elegidas.includes(l));
  return <SelectorTintero disponibles={disponibles} elegidas={elegidas} onCambiar={setElegidas} />;
}

describe('SelectorTintero', () => {
  it('al elegir una, sale del desplegable y aparece abajo; con la × vuelve', () => {
    render(<Prueba />);
    const select = screen.getByLabelText('Lecturas en el tintero que te gustaría hacer');
    fireEvent.change(select, { target: { value: 'c' } });
    expect(screen.queryByRole('option', { name: 'Circe, Madeline Miller' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Betty, Tiffany McDaniel' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Circe, Madeline Miller' }));
    expect(screen.getByRole('option', { name: 'Circe, Madeline Miller' })).toBeInTheDocument();
  });

  it('sin lecturas disponibles lo dice y se desactiva', () => {
    render(<SelectorTintero disponibles={[]} elegidas={[]} onCambiar={vi.fn()} />);
    expect(screen.getByLabelText('Lecturas en el tintero que te gustaría hacer')).toBeDisabled();
    expect(screen.getByRole('option')).toHaveTextContent('No quedan más lecturas');
  });
});
