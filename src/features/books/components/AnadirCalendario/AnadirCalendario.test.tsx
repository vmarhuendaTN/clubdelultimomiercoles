import { render, screen } from '@testing-library/react';
import { AnadirCalendario } from './AnadirCalendario';

const LECTURA = {
  slug: 'el-sentido-de-un-final',
  titulo: 'El sentido de un final',
  autor: 'Julian Barnes',
  fechaSesion: '2026-11-25',
};

describe('AnadirCalendario', () => {
  it('dice hora y lugar y enlaza la suscripción y Google Calendar', () => {
    render(<AnadirCalendario lectura={LECTURA} />);
    expect(screen.getByText(/A las 19:30 en/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Librería Celama' })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps'),
    );
    expect(screen.getByRole('link', { name: 'Añadir a mi calendario' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^webcal:\/\/.+\/calendario\.ics$/),
    );
    expect(screen.getByRole('link', { name: 'Google Calendar' })).toHaveAttribute(
      'href',
      expect.stringContaining('calendar.google.com/calendar/render?cid=webcal'),
    );
    expect(screen.getByRole('link', { name: 'Añade solo esta sesión' })).toHaveAttribute(
      'href',
      expect.stringContaining('dates=20261125T193000%2F20261125T213000'),
    );
  });

  it('sin fecha de sesión no muestra nada', () => {
    const { container } = render(
      <AnadirCalendario lectura={{ ...LECTURA, fechaSesion: undefined }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
