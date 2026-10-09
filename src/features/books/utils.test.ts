import { bookHref, coverAlt } from './utils';

describe('utils de libros', () => {
  it('construye el alt de la portada', () => {
    expect(coverAlt({ titulo: 'Piranesi', autor: 'Susanna Clarke' })).toBe(
      'Portada de Piranesi, de Susanna Clarke',
    );
  });

  it('construye la ruta de la ficha con barra final', () => {
    expect(bookHref('el-secreto')).toBe('/lecturas/el-secreto/');
  });
});
