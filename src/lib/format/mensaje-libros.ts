/** Detalles de un libro que el club enseña al recomendarlo o ponerlo a votación. */
export type DetallesLibro = {
  /** Año de publicación («1866»). */
  anio?: string;
  /** Páginas tal cual se escriben: «832», «832 págs. aprox.». */
  paginas?: string;
  sinopsis?: string;
  /** Nota sobre este libro (edición, traducción…). */
  nota?: string;
};

export type LibroDelMensaje = DetallesLibro & { titulo: string; autor: string };

export type MensajeLeido = {
  libros: LibroDelMensaje[];
  /** Notas del mensaje («NOTA 1: …»), separadas por una línea en blanco. */
  notas: string;
};

/** «832» → «832 págs.»; lo que ya trae texto se deja como está. */
export function textoPaginas(paginas = ''): string {
  const p = paginas.trim();
  return /^\d+$/.test(p) ? `${p} págs.` : p;
}

/** «1866 · 832 págs. aprox.» (vacío si no hay ninguno). */
export function lineaDetalles(d: DetallesLibro): string {
  return [d.anio?.trim(), textoPaginas(d.paginas)].filter(Boolean).join(' · ');
}

// «[11/11/26, 22:24:57] Inés de Cuenca Barella: » al principio de cada mensaje copiado.
const CABECERA_WHATSAPP = /^\s*\[[^\]]{4,40}\]\s*[^:\n]{1,80}:\s*/;
// «1. », «2) », «3 - » al empezar un libro.
const NUMERO = /^\s*(\d{1,2})\s*[.)\-–]\s+(.+)$/;
// «NOTA 1:», «Nota:», «NB:».
const NOTA = /^\s*(?:nota(?:\s*\d+)?|nb)\s*[:.-]\s*(.*)$/i;
// «Título, de Autor (1866) - 832 págs. aprox.»
const TITULO_AUTOR = /^(.+),\s+de\s+(.+?)\s*(?:\((\d{3,4})\))?\s*(?:[-–—]\s*(.+))?$/i;
// «Título - Autor (1866)» o «Título (1866) - 832 págs.»
const TITULO_ANIO = /^(.+?)\s*\((\d{3,4})\)\s*(?:[-–—]\s*(.+))?$/;

function leerCabeceraLibro(linea: string): LibroDelMensaje {
  const limpia = linea.replace(/\s+/g, ' ').trim();
  const conAutor = TITULO_AUTOR.exec(limpia);
  if (conAutor) {
    const [, titulo = '', autor = '', anio, resto] = conAutor;
    return { titulo: titulo.trim(), autor: autor.trim(), anio: anio ?? '', paginas: resto ?? '' };
  }
  const conAnio = TITULO_ANIO.exec(limpia);
  if (conAnio) {
    const [, titulo = '', anio, resto] = conAnio;
    return { titulo: titulo.trim(), autor: '', anio: anio ?? '', paginas: resto ?? '' };
  }
  return { titulo: limpia, autor: '', anio: '', paginas: '' };
}

/**
 * Lee un mensaje como los que se mandan al grupo («1. Crimen y castigo, de Fiódor Dostoievski
 * (1866) - 832 págs. aprox.» y debajo la sinopsis; «NOTA 1: …») y saca los libros y las notas.
 * Quita las cabeceras de WhatsApp («[11/11/26, 22:24:57] Nombre: »).
 */
export function leerMensajeLibros(mensaje: string): MensajeLeido {
  const libros: LibroDelMensaje[] = [];
  const notas: string[] = [];
  let destino: 'nada' | 'libro' | 'nota' = 'nada';
  const sinopsis: string[][] = [];

  for (const cruda of mensaje.split(/\r?\n/)) {
    const linea = cruda.replace(CABECERA_WHATSAPP, '').trim();
    if (!linea) continue;
    const numero = NUMERO.exec(linea);
    const nota = NOTA.exec(linea);
    if (numero) {
      libros.push(leerCabeceraLibro(numero[2] ?? ''));
      sinopsis.push([]);
      destino = 'libro';
    } else if (nota) {
      notas.push(nota[1]?.trim() ?? '');
      destino = 'nota';
    } else if (destino === 'libro') {
      sinopsis[sinopsis.length - 1]?.push(linea);
    } else if (destino === 'nota') {
      notas[notas.length - 1] = `${notas[notas.length - 1] ?? ''} ${linea}`.trim();
    }
  }

  return {
    libros: libros.map((l, i) => ({ ...l, sinopsis: (sinopsis[i] ?? []).join(' ') })),
    notas: notas.filter(Boolean).join('\n\n'),
  };
}
