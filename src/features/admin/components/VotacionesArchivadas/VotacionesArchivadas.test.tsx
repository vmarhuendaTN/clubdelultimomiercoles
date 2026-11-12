import { fireEvent, render, screen } from '@testing-library/react';
import { VotacionesArchivadas } from './VotacionesArchivadas';

describe('VotacionesArchivadas', () => {
  it('lista las archivadas con la más votada y deja verlas', () => {
    const onVer = vi.fn();
    render(
      <VotacionesArchivadas
        actual="2027-01"
        onVer={onVer}
        votaciones={[
          { clave: '2027-01', etiqueta: 'Enero de 2027' },
          {
            clave: '2026-11',
            etiqueta: 'Noviembre de 2026',
            ganadora: { candidata: { titulo: 'Circe' }, votos: 3 },
          },
        ]}
      />,
    );
    expect(screen.getByText('La más votada: «Circe» · 3 votos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver la votación de Enero de 2027' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver la votación de Noviembre de 2026' }));
    expect(onVer).toHaveBeenCalledWith('2026-11');
  });

  it('sin archivadas no pinta nada', () => {
    const { container } = render(
      <VotacionesArchivadas votaciones={[]} actual="" onVer={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
