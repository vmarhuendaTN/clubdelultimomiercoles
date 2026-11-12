import { fireEvent, render, screen, within } from '@testing-library/react';
import type { SesionClub } from '../../services/sesiones';
import { ArchivoSesiones } from './ArchivoSesiones';

const S = (
  clave: string,
  etiqueta: string,
  archivada: boolean,
  extra: Partial<SesionClub> = {},
): SesionClub => ({
  clave,
  etiqueta,
  anio: clave.slice(0, 4),
  archivada,
  propuestas: 3,
  personas: 3,
  libros: 7,
  candidatas: 0,
  votantes: 0,
  votacionAbierta: false,
  ...extra,
});

const SESIONES = [
  S('2027-01', 'Enero de 2027', false, { votacionAbierta: true, candidatas: 2 }),
  S('2026-11', 'Noviembre de 2026', true, {
    candidatas: 3,
    votantes: 9,
    ganadora: { titulo: 'Circe', autor: 'Madeline Miller', votos: 4 },
  }),
  S('2026-09', 'Septiembre de 2026', true),
  S('2025-11', 'Noviembre de 2025', true),
];

function pintar(esAdmin = true) {
  const onVer = vi.fn();
  const onArchivar = vi.fn();
  render(
    <ArchivoSesiones
      sesiones={SESIONES}
      esAdmin={esAdmin}
      ocupado={false}
      onVer={onVer}
      onArchivar={onArchivar}
    />,
  );
  return { onVer, onArchivar };
}

describe('ArchivoSesiones', () => {
  it('separa las sesiones en curso del archivo agrupado por años', () => {
    pintar();
    const enCurso = screen.getByRole('region', { name: 'En curso' });
    expect(within(enCurso).getByRole('heading', { name: 'Enero de 2027' })).toBeInTheDocument();
    expect(within(enCurso).getByText('Votación abierta')).toBeInTheDocument();
    const anio2026 = screen.getByRole('region', { name: /^2026/ });
    expect(within(anio2026).getByText('2 sesiones')).toBeInTheDocument();
    expect(
      within(anio2026)
        .getAllByRole('heading', { level: 5 })
        .map((h) => h.textContent),
    ).toEqual(['Noviembre', 'Septiembre']);
    expect(screen.getByRole('region', { name: /^2025/ })).toBeInTheDocument();
  });

  it('resume cada sesión con su ganadora', () => {
    pintar();
    expect(screen.getByText('3 personas · 7 libros · 3 candidatas · 9 votos')).toBeInTheDocument();
    expect(screen.getByText('Ganó «Circe», de Madeline Miller · 4 votos')).toBeInTheDocument();
    expect(screen.getAllByText('Sin votación')).toHaveLength(2);
  });

  it('la admin archiva, desarchiva y abre una sesión', () => {
    const { onVer, onArchivar } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Archivar Enero de 2027' }));
    expect(onArchivar).toHaveBeenCalledWith('2027-01', true);
    fireEvent.click(screen.getByRole('button', { name: 'Desarchivar Noviembre de 2026' }));
    expect(onArchivar).toHaveBeenCalledWith('2026-11', false);
    fireEvent.click(screen.getByRole('button', { name: 'Ver Septiembre de 2026' }));
    expect(onVer).toHaveBeenCalledWith('2026-09');
  });

  it('una editora puede ver pero no archivar', () => {
    pintar(false);
    expect(screen.queryByRole('button', { name: /Archivar|Desarchivar/ })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(4);
  });
});
