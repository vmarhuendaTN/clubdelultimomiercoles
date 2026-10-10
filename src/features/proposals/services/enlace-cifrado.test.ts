import { cifrarEnlace, descifrarEnlace, normalizarCodigo } from './enlace-cifrado';

const ENLACE = 'https://docs.google.com/forms/d/e/ejemplo/viewform?embedded=true';

describe('enlace cifrado', () => {
  it('solo se descifra con el código correcto', async () => {
    const cifrado = await cifrarEnlace(ENLACE, 'codigo-de-prueba');
    expect(cifrado.datos).not.toContain('docs.google.com');
    expect(await descifrarEnlace(cifrado, 'codigo-de-prueba')).toBe(ENLACE);
    expect(await descifrarEnlace(cifrado, 'otro')).toBeNull();
  });

  it('ignora mayúsculas y espacios del código', async () => {
    const cifrado = await cifrarEnlace(ENLACE, 'Codigo');
    expect(await descifrarEnlace(cifrado, '  CODIGO ')).toBe(ENLACE);
    expect(normalizarCodigo(' AbC ')).toBe('abc');
  });

  it('un enlace cifrado dañado no rompe: devuelve null', async () => {
    expect(await descifrarEnlace({ sal: 'x', iv: 'y', datos: 'z' }, 'codigo')).toBeNull();
  });
});
