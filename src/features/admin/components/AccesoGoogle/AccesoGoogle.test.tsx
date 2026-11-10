import { render, screen } from '@testing-library/react';
import { AccesoGoogle } from './AccesoGoogle';

vi.mock('@/lib/env', () => ({ env: { googleClientId: 'cliente', appsScriptUrl: '' } }));

describe('AccesoGoogle', () => {
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
