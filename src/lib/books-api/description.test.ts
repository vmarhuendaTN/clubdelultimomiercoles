import { sanitizeDescription } from './description';

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
