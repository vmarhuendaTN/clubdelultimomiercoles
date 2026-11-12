import { fireEvent, render, screen } from '@testing-library/react';
import { NotaSesionEditor } from './NotaSesionEditor';

describe('NotaSesionEditor', () => {
  it('la admin edita y guarda las notas', () => {
    const onGuardar = vi.fn();
    render(
      <NotaSesionEditor
        etiqueta="Enero de 2027"
        nota=""
        esAdmin
        ocupado={false}
        onGuardar={onGuardar}
      />,
    );
    const boton = screen.getByRole('button', { name: 'Guardar notas' });
    expect(boton).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Notas del club para Enero de 2027/), {
      target: { value: ' En abril, autores españoles. ' },
    });
    fireEvent.click(boton);
    expect(onGuardar).toHaveBeenCalledWith('En abril, autores españoles.');
  });

  it('el resto del equipo solo la lee', () => {
    render(
      <NotaSesionEditor
        etiqueta="Enero de 2027"
        nota="Hola"
        esAdmin={false}
        ocupado={false}
        onGuardar={vi.fn()}
      />,
    );
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
