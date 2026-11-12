import { enlace, mensajePropuestas, mensajeVotacion } from './mensajes-whatsapp';

const BASE = 'https://club.example/web/';

describe('mensajes para WhatsApp', () => {
  it('monta el enlace con la base de la web', () => {
    expect(enlace('/votar/', BASE)).toBe('https://club.example/web/votar/');
  });

  it('mensaje de votación con las candidatas y el enlace', () => {
    expect(
      mensajeVotacion(
        'Enero de 2027',
        [
          { titulo: 'Circe', autor: 'Madeline Miller' },
          { titulo: 'Betty', autor: '' },
        ],
        BASE,
      ).split('\n'),
    ).toEqual([
      'Votación de la próxima lectura · Enero de 2027',
      '',
      'Candidatas:',
      '· Circe, Madeline Miller',
      '· Betty',
      '',
      'Marca todas las que te apetezcan (puedes elegir varias) aquí, con el código del club:',
      'https://club.example/web/votar/',
    ]);
  });

  it('mensaje de propuestas con el enlace', () => {
    const m = mensajePropuestas('Enero de 2027', BASE);
    expect(m).toMatch(/^Propuestas para enero de 2027/);
    expect(m).toMatch(/https:\/\/club\.example\/web\/proponer\/$/);
  });
});
