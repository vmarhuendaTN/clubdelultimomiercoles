import { render, screen } from '@testing-library/react';
import { Cifra } from './Cifra';

describe('Cifra', () => {
  it('muestra el valor, la etiqueta y el detalle', () => {
    render(<Cifra valor={12} etiqueta="Personas" detalle="han propuesto" />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Personas')).toBeInTheDocument();
    expect(screen.getByText('han propuesto')).toBeInTheDocument();
  });
});

describe('Cifra pulsable', () => {
  it('es un botón con estado pulsado', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const onPulsar = vi.fn();
    render(<Cifra valor={3} etiqueta="Coincidencias" onPulsar={onPulsar} activa />);
    const boton = screen.getByRole('button', { name: /Coincidencias/ });
    expect(boton).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(boton);
    expect(onPulsar).toHaveBeenCalled();
  });
});
