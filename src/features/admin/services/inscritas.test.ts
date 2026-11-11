import type { Inscrita } from '../types';
import {
  enlaceTelefono,
  filtrarInscritas,
  filtrarSinInscribir,
  resumenInscritas,
} from './inscritas';

const inscrita = (cambios: Partial<Inscrita>): Inscrita => ({
  id: 'i',
  nombre: 'Ana',
  apellidos: 'García',
  telefono: '',
  email: '',
  alta: '2026-11-11',
  activa: 'si',
  participaciones_auto: '0',
  ajuste: '',
  participaciones: '0',
  notas: '',
  ...cambios,
});

const LISTA = [
  inscrita({ id: '1', nombre: 'Marta', apellidos: 'Ruiz', participaciones: '2' }),
  inscrita({ id: '2', nombre: 'Inés', telefono: '+34 600 11 22 33', participaciones: '5' }),
  inscrita({ id: '3', nombre: 'Luis', activa: 'no', participaciones: '1' }),
  inscrita({ id: '4', nombre: 'Ana', email: 'ana@example.com', participaciones: '2' }),
];

describe('inscritas', () => {
  it('resume activas, bajas y participaciones', () => {
    expect(
      resumenInscritas(LISTA, [{ nombre: 'Eva', apellidos: '', participaciones: '1' }]),
    ).toEqual({ activas: 3, bajas: 1, sinInscribir: 1, participaciones: 9 });
  });

  it('ordena por participaciones y luego por nombre', () => {
    expect(filtrarInscritas(LISTA, 'activas', '').map((i) => i.id)).toEqual(['2', '4', '1']);
    expect(filtrarInscritas(LISTA, 'bajas', '').map((i) => i.id)).toEqual(['3']);
  });

  it('busca sin tildes, por email y por teléfono', () => {
    expect(filtrarInscritas(LISTA, 'activas', 'ines').map((i) => i.id)).toEqual(['2']);
    expect(filtrarInscritas(LISTA, 'activas', 'ana@').map((i) => i.id)).toEqual(['4']);
    expect(filtrarInscritas(LISTA, 'activas', '600 11').map((i) => i.id)).toEqual(['2']);
  });

  it('filtra quién ha propuesto sin estar inscrita', () => {
    const lista = [
      { nombre: 'Eva', apellidos: 'Sanz', participaciones: '1' },
      { nombre: 'Óscar', apellidos: 'Gil', participaciones: '3' },
    ];
    expect(filtrarSinInscribir(lista, '').map((p) => p.nombre)).toEqual(['Óscar', 'Eva']);
    expect(filtrarSinInscribir(lista, 'oscar').map((p) => p.nombre)).toEqual(['Óscar']);
  });

  it('prepara el enlace de teléfono', () => {
    expect(enlaceTelefono('+34 600 11-22-33')).toBe('tel:+34600112233');
  });
});
