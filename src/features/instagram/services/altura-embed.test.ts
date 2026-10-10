import { alturaDeMensaje } from './altura-embed';

const IG = 'https://www.instagram.com';

describe('alturaDeMensaje', () => {
  it('lee la altura que manda Instagram (texto JSON u objeto)', () => {
    const data = JSON.stringify({ type: 'MEASURE', details: { height: 812.4 } });
    expect(alturaDeMensaje({ origin: IG, data })).toBe(813);
    expect(
      alturaDeMensaje({ origin: IG, data: { type: 'MEASURE', details: { height: 600 } } }),
    ).toBe(600);
  });

  it('ignora mensajes de otros orígenes, de otro tipo o mal formados', () => {
    const data = JSON.stringify({ type: 'MEASURE', details: { height: 500 } });
    expect(alturaDeMensaje({ origin: 'https://otra.web', data })).toBeNull();
    expect(alturaDeMensaje({ origin: IG, data: JSON.stringify({ type: 'LOADED' }) })).toBeNull();
    expect(alturaDeMensaje({ origin: IG, data: '{no es json' })).toBeNull();
    expect(
      alturaDeMensaje({ origin: IG, data: { type: 'MEASURE', details: { height: -1 } } }),
    ).toBeNull();
  });
});
