import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const segments = [
  { value: 'leidos', label: 'Leídos' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'propuestas', label: 'Propuestas' },
] as const;

function Demo() {
  const [value, setValue] = useState<(typeof segments)[number]['value']>('leidos');
  return (
    <SegmentedControl
      id="filtro"
      label="Filtrar"
      segments={segments}
      value={value}
      onChange={setValue}
    />
  );
}

describe('SegmentedControl', () => {
  it('sigue el patrón de pestañas ARIA', () => {
    render(<Demo />);
    expect(screen.getByRole('tablist', { name: 'Filtrar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Leídos' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Próximo' })).toHaveAttribute('tabindex', '-1');
  });

  it('se maneja con flechas, Inicio y Fin', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('tab', { name: 'Leídos' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Próximo' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Próximo' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Propuestas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Leídos' })).toHaveAttribute('aria-selected', 'true');
  });
});
