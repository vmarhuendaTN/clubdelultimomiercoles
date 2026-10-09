import type { Volume } from '../types';

/** Volúmenes de ejemplo con la forma real de la API (datos abreviados). */
export const hillHouse: Volume = {
  id: 'hill-es',
  volumeInfo: {
    title: 'La maldición de Hill House',
    authors: ['Shirley Jackson'],
    publisher: 'Minúscula',
    publishedDate: '2014-03-01',
    description:
      '<p>Cuatro desconocidos se instalan en Hill House, una mansión con fama de encantada, para investigar sus fenómenos. Lo que empieza como un experimento se convierte en una experiencia que pondrá a prueba su cordura. Un clásico absoluto de la literatura de terror.</p>',
    industryIdentifiers: [
      { type: 'ISBN_10', identifier: '8495587990' },
      { type: 'ISBN_13', identifier: '9788495587992' },
    ],
    pageCount: 256,
    categories: ['Fiction / Horror'],
    language: 'es',
    imageLinks: { thumbnail: 'http://books.google.com/books/content?id=hill-es&zoom=1&edge=curl' },
    canonicalVolumeLink:
      'https://books.google.com/books/about/La_maldici%C3%B3n_de_Hill_House.html?id=hill-es',
  },
};

export const hillHouseCompleto: Volume = {
  ...hillHouse,
  volumeInfo: {
    ...hillHouse.volumeInfo,
    imageLinks: {
      thumbnail: 'http://books.google.com/books/content?id=hill-es&zoom=1&edge=curl',
      large: 'http://books.google.com/books/content?id=hill-es&zoom=3&edge=curl',
    },
  },
};

export const guiaHillHouse: Volume = {
  id: 'hill-guia',
  volumeInfo: {
    title: 'Guía de lectura: La maldición de Hill House',
    authors: ['Editorial Escolar'],
    language: 'es',
  },
};

export const hillHouseIngles: Volume = {
  id: 'hill-en',
  volumeInfo: {
    title: 'The Haunting of Hill House',
    authors: ['Shirley Jackson'],
    language: 'en',
    pageCount: 246,
  },
};
