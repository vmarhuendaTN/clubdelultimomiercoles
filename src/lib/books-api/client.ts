import type { Volume, VolumesResponse } from './types';
import type { SearchAttempt } from './query-builder';

const API = 'https://www.googleapis.com/books/v1/volumes';
const CAMPOS_BUSQUEDA =
  'items(id,volumeInfo(title,subtitle,authors,publisher,publishedDate,description,industryIdentifiers,pageCount,categories,language,imageLinks,canonicalVolumeLink)),totalItems';
const CAMPOS_VOLUMEN =
  'id,volumeInfo(title,subtitle,authors,publisher,publishedDate,description,industryIdentifiers,pageCount,categories,language,imageLinks,canonicalVolumeLink)';
const TIMEOUT_MS = 8000;
const ESPERAS_MS = [1000, 2000, 4000];

/** Cuota agotada o clave rechazada: el sync de libros se detiene sin romper el resto. */
export class QuotaError extends Error {
  constructor(status: number) {
    super(`Google Books respondió ${status}: cuota agotada o clave no válida`);
    this.name = 'QuotaError';
  }
}

export type BooksClient = {
  search: (attempt: SearchAttempt) => Promise<Volume[]>;
  getVolume: (id: string) => Promise<Volume | null>;
  /** Consultas hechas (para sync_runs). */
  readonly requests: number;
};

type ClientOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createBooksClient({
  apiKey,
  fetchImpl = fetch,
  sleep = defaultSleep,
}: ClientOptions): BooksClient {
  let requests = 0;

  async function get<T>(url: URL): Promise<T | null> {
    url.searchParams.set('key', apiKey);
    url.searchParams.set('country', 'ES');
    for (let intento = 0; ; intento++) {
      requests++;
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.ok) return (await res.json()) as T;
      if (res.status === 404) return null;
      if (res.status === 403) throw new QuotaError(res.status);
      const reintentable = res.status === 429 || res.status >= 500;
      const espera = ESPERAS_MS[intento];
      if (!reintentable || espera === undefined) {
        if (res.status === 429) throw new QuotaError(res.status);
        throw new Error(`Google Books respondió ${res.status}`);
      }
      await sleep(espera);
    }
  }

  return {
    get requests() {
      return requests;
    },
    async search({ q, langRestrict }) {
      const url = new URL(API);
      url.searchParams.set('q', q);
      url.searchParams.set('printType', 'books');
      url.searchParams.set('maxResults', '20');
      url.searchParams.set('projection', 'full');
      url.searchParams.set('fields', CAMPOS_BUSQUEDA);
      if (langRestrict) url.searchParams.set('langRestrict', langRestrict);
      const data = await get<VolumesResponse>(url);
      return data?.items ?? [];
    },
    async getVolume(id) {
      const url = new URL(`${API}/${encodeURIComponent(id)}`);
      url.searchParams.set('projection', 'full');
      url.searchParams.set('fields', CAMPOS_VOLUMEN);
      return get<Volume>(url);
    },
  };
}
