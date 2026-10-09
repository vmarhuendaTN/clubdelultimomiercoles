import { render, screen } from '@testing-library/react';
import { MAIN_ID, SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('apunta al contenido principal', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      `#${MAIN_ID}`,
    );
  });
});
