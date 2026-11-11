import { act, render, screen } from '@testing-library/react';
import { CuentaAtras } from './CuentaAtras';

const pintar = (iso: string) =>
  render(<CuentaAtras fecha="2026-11-25" ahora={() => new Date(iso)} />);

describe('CuentaAtras', () => {
  it('cuenta los días y las horas que faltan', () => {
    pintar('2026-11-11T10:00:00Z');
    const reloj = screen.getByRole('timer');
    expect(reloj).toHaveTextContent('14');
    expect(reloj).toHaveTextContent('días para la próxima sesión');
    expect(reloj).toHaveTextContent('y 8 horas');
  });

  it('mañana y hoy', () => {
    const { unmount } = pintar('2026-11-24T08:00:00Z');
    expect(screen.getByRole('timer')).toHaveTextContent('¡Mañana nos vemos!A las 19:30');
    unmount();
    pintar('2026-11-25T16:00:00Z');
    expect(screen.getByRole('timer')).toHaveTextContent(
      'Faltan 2 horas y 30 minutos · a las 19:30',
    );
  });

  it('pasada la sesión no muestra nada', () => {
    pintar('2026-11-27T10:00:00Z');
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('se actualiza cada minuto', () => {
    vi.useFakeTimers();
    let ahora = new Date('2026-11-25T18:28:00Z');
    render(<CuentaAtras fecha="2026-11-25" ahora={() => ahora} />);
    expect(screen.getByRole('timer')).toHaveTextContent('Faltan 2 minutos');
    ahora = new Date('2026-11-25T18:31:00Z');
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('La sesión está en marcha');
    vi.useRealTimers();
  });

  it('con dos clubs, cuenta hasta la siguiente quedada que no ha pasado', () => {
    const sesiones = [
      { fecha: '2026-11-26', nombre: 'Club 2' },
      { fecha: '2026-11-25', nombre: 'Club 1' },
    ];
    render(<CuentaAtras sesiones={sesiones} ahora={() => new Date('2026-11-20T10:00:00Z')} />);
    expect(screen.getByRole('timer')).toHaveTextContent('días para la quedada del Club 1');
  });

  it('pasada la del Club 1, cuenta hasta la del Club 2', () => {
    const sesiones = [
      { fecha: '2026-11-25', nombre: 'Club 1' },
      { fecha: '2026-11-26', nombre: 'Club 2' },
    ];
    render(<CuentaAtras sesiones={sesiones} ahora={() => new Date('2026-11-26T08:00:00Z')} />);
    expect(screen.getByRole('timer')).toHaveTextContent('¡Es hoy!');
    expect(screen.getByRole('timer')).toHaveTextContent('Club 2');
  });
});
