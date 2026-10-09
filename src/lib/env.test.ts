import { describe, expect, it } from 'vitest';
import { withBasePath } from './env';

describe('withBasePath', () => {
  it('añade la barra inicial si falta', () => {
    expect(withBasePath('sw.js')).toBe('/sw.js');
    expect(withBasePath('/sw.js')).toBe('/sw.js');
  });
});
