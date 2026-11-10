import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from './Select';

const OPCIONES = [
  { value: 'a', label: 'Uno' },
  { value: 'b', label: 'Dos' },
];

describe('Select', () => {
  it('asocia etiqueta, ayuda y error, y avisa del cambio', () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Estado"
        opciones={OPCIONES}
        ayuda="Elige uno"
        error="Obligatorio"
        onChange={onChange}
      />,
    );
    const campo = screen.getByLabelText('Estado');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Elige uno Obligatorio');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    fireEvent.change(campo, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled();
  });
});
