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
