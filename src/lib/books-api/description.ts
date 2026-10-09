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

export type Cita = { texto: string; fuente?: string };

const letras = (t: string) => t.replace(/[^\p{L}]/gu, '');
/** Eslogan de contraportada: casi todo en mayúsculas («30 ANIVERSARIO»). */
const esEslogan = (p: string) => {
  const l = letras(p);
  return l.length >= 4 && l === l.toUpperCase() && p.length < 300;
};
const CITA = /^[«"“](.+)[»"”]\.?$/s;
/** Firma de una cita: corta y sin punto final («Stephen King», «Bruno Cardeñosa, Onda Cero»). */
const esFirma = (p: string) => p.length <= 80 && !/[.!?…]$/.test(p) && !CITA.test(p);

/**
 * Separa el texto de contraportada que manda la editorial: quita los eslóganes en
 * mayúsculas y aparta las citas de prensa (con su firma) de la sinopsis propiamente dicha.
 */
export function separarCitas(parrafos: readonly string[]): { sinopsis: string[]; citas: Cita[] } {
  const sinopsis: string[] = [];
  const citas: Cita[] = [];
  for (let i = 0; i < parrafos.length; i++) {
    const p = parrafos[i]!;
    if (esEslogan(p)) continue;
    const cita = CITA.exec(p);
    if (cita && p.length <= 400) {
      const siguiente = parrafos[i + 1];
      const fuente = siguiente && esFirma(siguiente) ? siguiente : undefined;
      if (fuente) i++;
      citas.push({ texto: cita[1]!.trim(), fuente });
      continue;
    }
    sinopsis.push(p);
  }
  return { sinopsis, citas };
}
