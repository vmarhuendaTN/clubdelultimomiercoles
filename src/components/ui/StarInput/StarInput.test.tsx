import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { StarInput } from './StarInput';

function Demo() {
  const [v, setV] = useState(0);
  return <StarInput legend="Tu valoración" value={v} onChange={setV} />;
}

describe('StarInput', () => {
  it('es un grupo de radios con etiquetas en texto', async () => {
    render(<Demo />);
    expect(screen.getByRole('group', { name: 'Tu valoración' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '4 estrellas' }));
    expect(screen.getByRole('radio', { name: '4 estrellas' })).toBeChecked();
  });

  it('se maneja con las flechas', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('radio', { name: '2 estrellas' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '3 estrellas' })).toBeChecked();
  });
});
