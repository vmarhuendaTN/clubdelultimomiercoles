import { fireEvent, render, screen } from '@testing-library/react';
import { VotacionFinal } from './VotacionFinal';

const VOTACION = {
  sesion: '2027-01',
  candidatas: [
    { id: 'a', titulo: 'Circe', autor: 'Madeline Miller' },
    { id: 'b', titulo: 'Betty', autor: 'Tiffany McDaniel' },
  ],
};

describe('VotacionFinal', () => {
  it('explica la sesión y pide nombre, apellidos y al menos una puntuación', () => {
    const onEnviar = vi.fn();
    render(<VotacionFinal votacion={VOTACION} onEnviar={onEnviar} enviando={false} />);
    expect(screen.getByText(/candidatas para enero de 2027/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mi voto' }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Puntúa al menos una lectura.')).toBeInTheDocument();
  });

  it('envía las estrellas de cada candidata puntuada', () => {
    const onEnviar = vi.fn();
    render(<VotacionFinal votacion={VOTACION} onEnviar={onEnviar} enviando={false} />);
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'García' } });
    const circe = screen.getByRole('group', { name: 'Circe, Madeline Miller' });
    fireEvent.click(circe.querySelectorAll('input[type="radio"]')[4]!);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mi voto' }));
    expect(onEnviar).toHaveBeenCalledWith({ nombre: 'Ana', apellidos: 'García', puntos: { a: 5 } });
  });
});
