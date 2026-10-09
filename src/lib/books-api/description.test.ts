import { sanitizeDescription, separarCitas } from './description';

describe('sanitizeDescription', () => {
  it('convierte HTML en párrafos de texto plano', () => {
    expect(
      sanitizeDescription(
        '<p><b>Una novela</b> sobre la memoria.</p><p>Con <i>ecos</i> &amp; silencios.</p>',
      ),
    ).toEqual(['Una novela sobre la memoria.', 'Con ecos & silencios.']);
  });

  it('quita etiquetas peligrosas y comillas sueltas', () => {
    expect(sanitizeDescription('"<script>alert(1)</script>Texto   con  espacios"')).toEqual([
      'alert(1)Texto con espacios',
    ]);
  });

  it('respeta los saltos <br>', () => {
    expect(sanitizeDescription('Primera parte.<br><br>Segunda parte.')).toEqual([
      'Primera parte.',
      'Segunda parte.',
    ]);
  });

  it('sin sinopsis devuelve lista vacía', () => {
    expect(sanitizeDescription(undefined)).toEqual([]);
  });
});

describe('separarCitas', () => {
  it('quita eslóganes y aparta las citas de prensa con su firma', () => {
    const { sinopsis, citas } = separarCitas([
      '30 ANIVERSARIO',
      'POR LA AUTORA DE EL JILGUERO, GANADORA DEL PREMIO PULITZER',
      '«Una auténtica maravilla.»',
      'The New York Times',
      'La vida no es fácil en un college de Nueva Inglaterra.',
      '«Tan apasionante que corres el riesgo de no poder parar».',
      'El secreto se cuenta entre las mejores obras del siglo XX.',
    ]);
    expect(sinopsis).toEqual([
      'La vida no es fácil en un college de Nueva Inglaterra.',
      'El secreto se cuenta entre las mejores obras del siglo XX.',
    ]);
    expect(citas).toEqual([
      { texto: 'Una auténtica maravilla.', fuente: 'The New York Times' },
      { texto: 'Tan apasionante que corres el riesgo de no poder parar', fuente: undefined },
    ]);
  });

  it('deja intacta una sinopsis normal', () => {
    const texto = ['Cuatro desconocidos se instalan en Hill House.', 'Un clásico del terror.'];
    expect(separarCitas(texto)).toEqual({ sinopsis: texto, citas: [] });
  });
});
