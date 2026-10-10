import { enlaceSolicitud, validarSolicitud, type Solicitud } from './solicitud';

const solicitud: Solicitud = {
  nombre: 'Ana',
  apellidos: 'García López',
  telefono: '600 123 456',
  descripcion: 'Me encanta leer novela.',
  deParteDe: '',
};

describe('solicitud para entrar en el club', () => {
  it('pide nombre, apellidos, teléfono y descripción; «de parte de» es opcional', () => {
    expect(validarSolicitud(solicitud)).toEqual({});
    expect(
      Object.keys(
        validarSolicitud({
          nombre: ' ',
          apellidos: '',
          telefono: '123',
          descripcion: '',
          deParteDe: '',
        }),
      ),
    ).toEqual(['nombre', 'apellidos', 'telefono', 'descripcion']);
  });

  it('prepara el email con asunto y todos los datos', () => {
    const url = new URL(enlaceSolicitud('club@example.com', { ...solicitud, deParteDe: 'Inés' }));
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('club@example.com');
    expect(url.searchParams.get('subject')).toBe('Quiero ser del club: Ana García López');
    expect(url.searchParams.get('body')).toBe(
      'Nombre: Ana García López\nTeléfono: 600 123 456\nDe parte de: Inés\n\nMe encanta leer novela.',
    );
  });

  it('sin «de parte de» lo indica con una raya', () => {
    const url = new URL(enlaceSolicitud('club@example.com', solicitud));
    expect(url.searchParams.get('body')).toContain('De parte de: —');
  });
});
