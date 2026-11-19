import { render, screen } from '@testing-library/react';
import { AccesoGoogle } from './AccesoGoogle';

vi.mock('@/lib/env', () => ({ env: { googleClientId: 'cliente', appsScriptUrl: '' } }));

describe('AccesoGoogle', () => {
  it('ofrece entrar sin ventana emergente', () => {
    render(<AccesoGoogle onCredencial={vi.fn()} comprobando={false} />);
    expect(screen.getByRole('button', { name: 'Entrar sin ventana emergente' })).toBeEnabled();
  });

  it('al volver de Google con el token, lo entrega y limpia la URL', () => {
    window.localStorage.setItem('club:google-estado', 'abc');
    window.history.replaceState(null, '', '/back/#id_token=t.o.k&state=abc');
    const onCredencial = vi.fn();
    render(<AccesoGoogle onCredencial={onCredencial} comprobando={false} />);
    expect(onCredencial).toHaveBeenCalledWith('t.o.k');
    expect(window.location.hash).toBe('');
  });

  it('explica cómo entrar', () => {
    render(<AccesoGoogle onCredencial={vi.fn()} comprobando={false} />);
    expect(screen.getByText(/pestaña Equipo/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('avisa si la cuenta no está en el equipo', () => {
    render(<AccesoGoogle onCredencial={vi.fn()} comprobando={false} error="no_autorizado" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/no está en el equipo/);
  });

  it('mientras comprueba lo anuncia', () => {
    render(<AccesoGoogle onCredencial={vi.fn()} comprobando />);
    expect(screen.getByRole('status')).toHaveTextContent('Comprobando tu acceso…');
  });
});
