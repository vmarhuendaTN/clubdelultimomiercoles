import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Resultados } from '../../services/resultados-votacion';
import type { Candidata } from '../../types';
import { VotacionPanel } from './VotacionPanel';

const circe: Candidata = {
  id: 'a',
  sesion: '2027-01',
  titulo: 'Circe',
  autor: 'Madeline Miller',
  abierta: 'si',
  anio: '2018',
  paginas: '400',
};
const betty: Candidata = { id: 'b', sesion: '2027-01', titulo: 'Betty', autor: '', abierta: 'si' };

const RESULTADOS: Resultados = {
  abierta: true,
  archivada: false,
  candidatas: [circe, betty],
  votantes: ['Ana García', 'Luis Pérez'],
  votosPorPersona: [
    { nombre: 'Ana García', votoIds: ['v1', 'v3'] },
    { nombre: 'Luis Pérez', votoIds: ['v2'] },
  ],
  ranking: [
    { candidata: circe, votos: 2, porcentaje: 100, personas: ['Ana García', 'Luis Pérez'] },
    { candidata: betty, votos: 0, porcentaje: 0, personas: [] },
  ],
};

function pintar(props: Partial<Parameters<typeof VotacionPanel>[0]> = {}) {
  const handlers = {
    onAbrir: vi.fn(),
    onQuitar: vi.fn(),
    onElegir: vi.fn(),
    onCompartir: vi.fn(),
    onGuardarCandidata: vi.fn().mockResolvedValue(true),
    onImportar: vi.fn().mockResolvedValue(true),
    onGuardarNota: vi.fn(),
    onArchivar: vi.fn(),
  };
  render(
    <VotacionPanel
      resultados={RESULTADOS}
      etiqueta="Enero de 2027"
      nota=""
      esAdmin
      ocupado={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe('VotacionPanel', () => {
  it('muestra el estado, las cifras y los resultados como una encuesta', () => {
    pintar();
    expect(
      screen.getByRole('heading', { name: 'Votación final · Enero de 2027' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();
    expect(screen.getByText('Votantes').previousSibling).toHaveTextContent('2');
    expect(screen.getByText('2 votos · 100 %')).toBeInTheDocument();
    expect(screen.getByText('2018 · 400 págs.')).toBeInTheDocument();
    expect(screen.getByText('Ana García, Luis Pérez')).toBeInTheDocument();
    expect(screen.getByText('Va en cabeza')).toBeInTheDocument();
    expect(screen.getByText('Sin votos todavía')).toBeInTheDocument();
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

  it('la admin corrige los detalles de una candidata', async () => {
    const { onGuardarCandidata } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Editar «Circe»' }));
    const resultados = screen.getByRole('region', { name: 'Resultados' });
    fireEvent.change(within(resultados).getByLabelText('Sinopsis'), {
      target: { value: 'La hija de Helios.' },
    });
    fireEvent.click(within(resultados).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() =>
      expect(onGuardarCandidata).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Circe', sinopsis: 'La hija de Helios.' }),
        'a',
      ),
    );
  });

  it('archiva la votación; archivada solo deja desarchivar', () => {
    const { onArchivar } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Archivar votación' }));
    expect(onArchivar).toHaveBeenCalledWith(true);
  });

  it('archivada no deja abrir, editar ni añadir', () => {
    const { onArchivar } = pintar({
      resultados: { ...RESULTADOS, abierta: false, archivada: true },
    });
    expect(screen.getByText('Archivada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir votación' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Editar/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Añadir candidatas' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Desarchivar votación' }));
    expect(onArchivar).toHaveBeenCalledWith(false);
  });

  it('una editora no abre ni quita; sin candidatas explica cómo empezar', () => {
    pintar({
      esAdmin: false,
      resultados: {
        abierta: false,
        archivada: false,
        candidatas: [],
        votantes: [],
        votosPorPersona: [],
        ranking: [],
      },
    });
    expect(screen.queryByRole('button', { name: /votación/ })).toBeNull();
    expect(screen.getByText(/con el botón «A votación»/)).toBeInTheDocument();
  });

  it('copia el mensaje para WhatsApp', () => {
    const { onCompartir } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar mensaje para WhatsApp' }));
    expect(onCompartir).toHaveBeenCalled();
  });

  it('la admin añade una candidata que nadie propuso', async () => {
    const { onGuardarCandidata } = pintar();
    const anadir = screen.getByRole('region', { name: 'Añadir candidatas' });
    fireEvent.change(within(anadir).getByLabelText('Título'), {
      target: { value: 'Pedro Páramo' },
    });
    fireEvent.change(within(anadir).getByLabelText('Autor o autora'), {
      target: { value: 'Juan Rulfo' },
    });
    fireEvent.click(within(anadir).getByRole('button', { name: 'Añadir a la votación' }));
    await waitFor(() =>
      expect(onGuardarCandidata).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Pedro Páramo', autor: 'Juan Rulfo' }),
      ),
    );
  });

  it('la admin guarda las notas de la sesión', () => {
    const { onGuardarNota } = pintar();
    fireEvent.change(screen.getByLabelText(/Notas del club para Enero de 2027/), {
      target: { value: 'Páginas aproximadas.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar notas' }));
    expect(onGuardarNota).toHaveBeenCalledWith('Páginas aproximadas.');
  });

  it('borra el voto de alguien que votó por error', () => {
    const onEliminarVoto = vi.fn();
    pintar({ onEliminarVoto });
    expect(screen.getByText('Ana García (votó 2 veces)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el voto de Ana García' }));
    expect(onEliminarVoto).toHaveBeenCalledWith({ nombre: 'Ana García', votoIds: ['v1', 'v3'] });
  });
});
