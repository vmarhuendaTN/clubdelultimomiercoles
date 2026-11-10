import { fireEvent, render, screen } from '@testing-library/react';
import type { Resultados } from '../../services/resultados-votacion';
import type { Candidata } from '../../types';
import { VotacionPanel } from './VotacionPanel';

const circe: Candidata = {
  id: 'a',
  sesion: '2027-01',
  titulo: 'Circe',
  autor: 'Madeline Miller',
  abierta: 'si',
};
const betty: Candidata = { id: 'b', sesion: '2027-01', titulo: 'Betty', autor: '', abierta: 'si' };

const RESULTADOS: Resultados = {
  abierta: true,
  candidatas: [circe, betty],
  votantes: ['Ana García', 'Luis Pérez'],
  ranking: [
    { candidata: circe, votos: 2, total: 9, media: 4.5, reparto: [0, 0, 0, 1, 1] },
    { candidata: betty, votos: 0, total: 0, media: 0, reparto: [0, 0, 0, 0, 0] },
  ],
};

function pintar(props: Partial<Parameters<typeof VotacionPanel>[0]> = {}) {
  const handlers = { onAbrir: vi.fn(), onQuitar: vi.fn(), onElegir: vi.fn() };
  render(
    <VotacionPanel
      resultados={RESULTADOS}
      etiqueta="Enero de 2027"
      esAdmin
      ocupado={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe('VotacionPanel', () => {
  it('muestra el estado, las cifras, los resultados y quién ha votado', () => {
    pintar();
    expect(
      screen.getByRole('heading', { name: 'Votación final · Enero de 2027' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();
    expect(screen.getByText('Votantes').previousSibling).toHaveTextContent('2');
    expect(screen.getByText('4,5 · 2 votos · 9 puntos')).toBeInTheDocument();
    expect(screen.getByText('5★ × 1 · 4★ × 1')).toBeInTheDocument();
    expect(screen.getByText('Va en cabeza')).toBeInTheDocument();
    expect(screen.getByText('Sin votos todavía')).toBeInTheDocument();
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
  });

  it('la admin cierra la votación, quita candidatas y elige la ganadora', () => {
    const { onAbrir, onQuitar, onElegir } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar votación' }));
    expect(onAbrir).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar «Betty» de la votación' }));
    expect(onQuitar).toHaveBeenCalledWith(betty);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir «Circe» como próxima lectura' }));
    expect(onElegir).toHaveBeenCalledWith(circe);
  });

  it('una editora no abre ni quita; sin candidatas explica cómo empezar', () => {
    pintar({
      esAdmin: false,
      resultados: { abierta: false, candidatas: [], votantes: [], ranking: [] },
    });
    expect(screen.queryByRole('button', { name: /votación/ })).toBeNull();
    expect(screen.getByText(/con el botón «A votación»/)).toBeInTheDocument();
  });
});
