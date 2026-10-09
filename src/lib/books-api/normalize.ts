const ARTICULOS = new Set([
  'el',
  'la',
  'los',
  'las',
  'lo',
  'un',
  'una',
  'unos',
  'unas',
  'the',
  'a',
  'an',
]);

/** Minúsculas, sin tildes, sin puntuación y con espacios simples. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Palabras significativas de un título (sin artículos), solo para comparar. */
export function titleTokens(title: string): string[] {
  return normalizeText(title)
    .split(' ')
    .filter((t) => t && !ARTICULOS.has(t));
}

/**
 * Apellido principal del primer autor, para `inauthor:`.
 * "Kazuo Ishiguro" → "Ishiguro"; "Dominique Lapierre y Larry Collins" → "Lapierre";
 * "Madame de La Fayette" → "Fayette".
 */
export function mainSurname(autor: string): string {
  const primero = autor.split(/\s+(?:y|and|&)\s+|,/i)[0]?.trim() ?? autor;
  const palabras = primero.split(/\s+/).filter(Boolean);
  return palabras[palabras.length - 1] ?? primero;
}

/**
 * Similitud de títulos de 0 a 1 (conjuntos de palabras): tolera subtítulos
 * ("Circe" ≈ "Circe: una novela") y diferencias de tildes y puntuación.
 */
export function titleSimilarity(sheetTitle: string, candidate: string): number {
  const a = new Set(titleTokens(sheetTitle));
  const b = new Set(titleTokens(candidate));
  if (!a.size || !b.size) return 0;
  let comunes = 0;
  for (const t of a) if (b.has(t)) comunes++;
  const dice = (2 * comunes) / (a.size + b.size);
  const contenido = comunes / a.size;
  return Math.max(dice, contenido * 0.95);
}

/** ¿Algún autor del candidato contiene el apellido principal de la Sheet? */
export function authorMatches(sheetAutor: string, authors: readonly string[] = []): boolean {
  const apellido = normalizeText(mainSurname(sheetAutor));
  if (!apellido) return false;
  return authors.some((a) => normalizeText(a).split(' ').includes(apellido));
}
