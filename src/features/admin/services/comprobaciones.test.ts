import { VERSION_SCRIPT } from '@/lib/apps-script';
import { comprobar, finDireccion, problemas } from './comprobaciones';

const OK = { ok: true as const, version: VERSION_SCRIPT };
const DIAG = {
  ok: true as const,
  version: VERSION_SCRIPT,
  faltan: [],
  libros: 'ok',
  publicacion: { estado: 'ok' as const },
  sinVincular: 0,
};

describe('comprobaciones', () => {
  it('mientras carga, no hay problemas', () => {
    expect(problemas(comprobar({ estado: null, diagnostico: null }))).toEqual([]);
  });

  it('sin conexión, un único error con la solución', () => {
    const lista = comprobar({ estado: { ok: false, error: 'red' }, diagnostico: null });
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      estado: 'error',
      solucion: expect.stringContaining('Cualquier persona'),
    });
  });

  it('todo bien: ningún problema', () => {
    const lista = comprobar({ estado: OK, diagnostico: DIAG });
    expect(lista.map((c) => c.estado).every((e) => e === 'ok')).toBe(true);
    expect(problemas(lista)).toEqual([]);
  });

  it('script antiguo: error con enlace para copiar el código', () => {
    const lista = comprobar({
      estado: { ok: true, version: 3 },
      diagnostico: { ok: false, error: 'accion_desconocida' },
    });
    const version = lista.find((c) => c.id === 'version');
    expect(version).toMatchObject({
      estado: 'error',
      enlace: { url: expect.stringContaining('Code.gs') },
    });
    expect(lista.some((c) => c.id === 'diagnostico')).toBe(false);
  });

  it('claves, Google Libros, publicación y personas sin vincular', () => {
    const lista = comprobar({
      estado: OK,
      diagnostico: {
        ...DIAG,
        faltan: ['GH_DISPATCH_TOKEN', 'GOOGLE_BOOKS_API_KEY'],
        libros: 'La clave no es válida.',
        publicacion: { estado: 'ultima_fallo', url: 'https://github.com/x', creada_en: '' },
        sinVincular: 2,
      },
    });
    const p = problemas(lista);
    expect(p.map((c) => c.id)).toEqual(['propiedades', 'libros', 'publicar', 'vincular']);
    expect(p[0]?.detalle).toContain('Publicar ahora');
    expect(p[2]?.enlace?.url).toBe('https://github.com/x');
    expect(p[3]).toMatchObject({ estado: 'aviso', irA: 'inscritas' });
  });

  it('solo avisos (sin token de GitHub): avisa sin alarmar', () => {
    const p = problemas(
      comprobar({ estado: OK, diagnostico: { ...DIAG, faltan: ['GH_DISPATCH_TOKEN'] } }),
    );
    expect(p).toHaveLength(1);
    expect(p[0]?.estado).toBe('aviso');
  });

  it('reconoce la implementación por el final de su dirección', () => {
    expect(finDireccion('https://script.google.com/macros/s/AKfycbyfbsf_WO2ZE_bOw/exec')).toBe(
      '…_WO2ZE_bOw/exec',
    );
  });
});
