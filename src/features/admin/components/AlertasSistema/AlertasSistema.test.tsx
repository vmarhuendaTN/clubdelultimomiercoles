import { fireEvent, render, screen } from '@testing-library/react';
import { AlertasSistema } from './AlertasSistema';

describe('AlertasSistema', () => {
  it('sin problemas no se ve', () => {
    const { container } = render(
      <AlertasSistema
        onVer={vi.fn()}
        comprobaciones={[{ id: 'a', titulo: 'Bien', estado: 'ok', detalle: '' }]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('avisa de lo que falla y lleva a Estado', () => {
    const onVer = vi.fn();
    render(
      <AlertasSistema
        onVer={onVer}
        comprobaciones={[
          {
            id: 'a',
            titulo: 'El script de la hoja está desactualizado',
            estado: 'error',
            detalle: '',
          },
          { id: 'b', titulo: 'Falta CODIGO_CLUB', estado: 'aviso', detalle: '' },
        ]}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Hay 2 cosas que revisar');
    expect(screen.getByText('El script de la hoja está desactualizado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cómo arreglarlo' }));
    expect(onVer).toHaveBeenCalled();
  });
});
