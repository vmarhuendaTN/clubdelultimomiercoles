import { fireEvent, render, screen } from '@testing-library/react';
import { VotacionFinal } from './VotacionFinal';

const VOTACION = {
  sesion: '2027-01',
  candidatas: [
    { id: 'a', titulo: 'Circe', autor: 'Madeline Miller' },
    { id: 'b', titulo: 'Betty', autor: 'Tiffany McDaniel', anio: '2020', paginas: '520' },
  ],
  nota: 'Las páginas son aproximadas.',
};

describe('VotacionFinal', () => {
  it('explica la sesión, enseña detalles y nota, y pide al menos una lectura', () => {
    const onEnviar = vi.fn();
    render(<VotacionFinal votacion={VOTACION} onEnviar={onEnviar} enviando={false} />);
    expect(screen.getByText(/candidatas para enero de 2027/)).toBeInTheDocument();
    expect(screen.getByText('2020 · 520 págs.')).toBeInTheDocument();
    expect(screen.getByText('Las páginas son aproximadas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mi voto' }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Marca al menos una lectura.')).toBeInTheDocument();
  });

  it('como una encuesta: envía todas las candidatas marcadas', () => {
    const onEnviar = vi.fn();
    render(<VotacionFinal votacion={VOTACION} onEnviar={onEnviar} enviando={false} />);
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'García' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Circe/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Betty/ }));
    expect(screen.getByText('2 lecturas marcadas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mi voto' }));
    expect(onEnviar).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellidos: 'García',
      puntos: { a: 1, b: 1 },
    });
  });
});
