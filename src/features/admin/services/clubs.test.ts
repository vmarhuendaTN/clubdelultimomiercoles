import { clubDe, enClub, nombreClub } from './clubs';

describe('clubs', () => {
  it('reconoce el club escrito de varias formas', () => {
    expect(clubDe('Club 2')).toBe('2');
    expect(clubDe('1')).toBe('1');
    expect(clubDe('club1')).toBe('1');
    expect(clubDe('Miércoles')).toBe('');
    expect(clubDe(undefined)).toBe('');
    expect(nombreClub('2')).toBe('Club 2');
    expect(nombreClub('')).toBe('');
  });

  it('filtra por club', () => {
    expect(enClub('Club 1', '1')).toBe(true);
    expect(enClub('Club 2', '1')).toBe(false);
    expect(enClub('', '')).toBe(true);
  });
});
