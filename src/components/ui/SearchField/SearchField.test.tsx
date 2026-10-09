import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('tiene etiqueta accesible y avisa de cada cambio', async () => {
    const onChange = vi.fn();
    render(<SearchField label="Buscar por título o autor" value="" onChange={onChange} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar por título o autor' }), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
