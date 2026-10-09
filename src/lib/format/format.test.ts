import { formatBytes, formatFecha } from './index';

describe('format', () => {
  it('formatea fechas en español', () => {
    expect(formatFecha('2025-11-26')).toBe('26 de noviembre de 2025');
  });

  it('formatea tamaños', () => {
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1,5 MB');
  });
});
