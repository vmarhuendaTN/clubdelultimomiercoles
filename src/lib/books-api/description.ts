const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  mdash: '—',
  ndash: '–',
};

function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTIDADES[name.toLowerCase()] ?? m);
}

/**
 * Sinopsis de Google (puede traer HTML) → párrafos de texto plano.
 * Más estricta que la lista blanca de GOOGLE-BOOKS § 6: se queda solo con los
 * párrafos, así la web nunca inserta HTML de terceros.
 */
export function sanitizeDescription(html: string | undefined): string[] {
  if (!html) return [];
  const conSaltos = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<[^>]*>/g, '');
  return decode(conSaltos)
    .split(/\n{2,}|\n(?=\s*[A-ZÁÉÍÓÚÑ¿¡«—])/)
    .map((p) =>
      p
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^["“”']+|["“”']+$/g, '')
        .trim(),
    )
    .filter(Boolean);
}

export function descriptionLength(paragraphs: readonly string[]): number {
  return paragraphs.reduce((n, p) => n + p.length, 0);
}
