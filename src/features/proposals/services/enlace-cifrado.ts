/**
 * Enlace cifrado con un código de acceso (AES-GCM con clave derivada por PBKDF2).
 *
 * La web es estática y el repositorio público: ni el código ni el enlace del formulario
 * pueden ir en claro. Solo se publica el enlace cifrado; quien escribe el código correcto
 * lo descifra en su navegador. Funciona igual en Node (scripts y tests) que en el navegador.
 */
export type EnlaceCifrado = {
  /** Sal de PBKDF2, en base64. */
  sal: string;
  /** Vector de inicialización de AES-GCM, en base64. */
  iv: string;
  /** Enlace cifrado, en base64. */
  datos: string;
};

const ITERACIONES = 250_000;

/** El código no distingue mayúsculas ni espacios al principio o al final. */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toLowerCase();
}

const aBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const deBase64 = (texto: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));

async function derivarClave(codigo: string, sal: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalizarCodigo(codigo)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function cifrarEnlace(enlace: string, codigo: string): Promise<EnlaceCifrado> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const clave = await derivarClave(codigo, sal);
  const datos = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    clave,
    new TextEncoder().encode(enlace),
  );
  return { sal: aBase64(sal), iv: aBase64(iv), datos: aBase64(new Uint8Array(datos)) };
}

/** Devuelve el enlace si el código es correcto; `null` si no lo es. */
export async function descifrarEnlace(
  cifrado: EnlaceCifrado,
  codigo: string,
): Promise<string | null> {
  try {
    const clave = await derivarClave(codigo, deBase64(cifrado.sal));
    const datos = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: deBase64(cifrado.iv) },
      clave,
      deBase64(cifrado.datos),
    );
    return new TextDecoder().decode(datos);
  } catch {
    return null;
  }
}
