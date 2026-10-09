import { cleanCoverUrl, pickCoverUrl } from './cover';

describe('portadas', () => {
  it('fuerza https y quita el borde doblado', () => {
    expect(
      cleanCoverUrl(
        'http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl',
      ),
    ).toBe('https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1');
  });

  it('elige el mayor tamaño disponible', () => {
    expect(
      pickCoverUrl({
        thumbnail: 'http://x.test/t',
        medium: 'http://x.test/m',
        small: 'http://x.test/s',
      }),
    ).toBe('https://x.test/m');
    expect(pickCoverUrl(undefined)).toBeUndefined();
  });
});
