import { leerRetorno, urlDeAcceso } from './google-redireccion';

describe('acceso con Google por redirección', () => {
  it('monta la URL de Google con nonce y estado', () => {
    const u = new URL(urlDeAcceso('cli', 'https://x.es/back/', 'abc'));
    expect(u.origin + u.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(u.searchParams.get('response_type')).toBe('id_token');
    expect(u.searchParams.get('redirect_uri')).toBe('https://x.es/back/');
    expect(u.searchParams.get('nonce')).toBe('abc');
    expect(u.searchParams.get('state')).toBe('abc');
  });

  it('una URL sin datos de Google no es una vuelta', () => {
    expect(leerRetorno('', 'abc')).toBeNull();
    expect(leerRetorno('#seccion', 'abc')).toBeNull();
  });

  it('acepta el token si el estado coincide', () => {
    expect(leerRetorno('#id_token=t.o.k&state=abc', 'abc')).toEqual({
      tipo: 'token',
      idToken: 't.o.k',
    });
  });

  it('rechaza un estado distinto o ausente', () => {
    expect(leerRetorno('#id_token=t&state=otro', 'abc')).toEqual({ tipo: 'error' });
    expect(leerRetorno('#id_token=t&state=abc', null)).toEqual({ tipo: 'error' });
  });

  it('un error de Google es un error', () => {
    expect(leerRetorno('#error=access_denied&state=abc', 'abc')).toEqual({ tipo: 'error' });
  });
});
