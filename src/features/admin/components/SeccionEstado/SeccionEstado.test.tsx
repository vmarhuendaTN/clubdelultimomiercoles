import { fireEvent, render, screen } from '@testing-library/react';
import { SeccionEstado } from './SeccionEstado';

describe('SeccionEstado', () => {
  it('muestra qué falla, cómo arreglarlo y lleva a la sección', () => {
    const onIrA = vi.fn();
    const onRecargar = vi.fn();
    render(
      <SeccionEstado
        onIrA={onIrA}
        onRecargar={onRecargar}
        comprobaciones={[
          { id: 'conexion', titulo: 'Conexión con la hoja', estado: 'ok', detalle: 'Responde.' },
          {
            id: 'vincular',
            titulo: '2 personas sin unir',
            estado: 'aviso',
            detalle: 'Escribieron su nombre a mano.',
            solucion: 'Pulsa «Sí, vincular».',
            irA: 'inscritas',
          },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Funciona' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Revisar' })).toBeInTheDocument();
    expect(screen.getByText('Pulsa «Sí, vincular».')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Inscritas' }));
    expect(onIrA).toHaveBeenCalledWith('inscritas');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a comprobar' }));
    expect(onRecargar).toHaveBeenCalled();
  });
});
