import { render, screen } from '@testing-library/react';
import { ThemedImage } from './ThemedImage';

const img = (src: string) => ({ src, width: 100, height: 50 });

describe('ThemedImage', () => {
  it('sirve la variante oscura con prefers-color-scheme', () => {
    const { container } = render(
      <ThemedImage
        claro={img('/claro.webp')}
        oscuro={img('/oscuro.webp')}
        alt="Logo"
        sizes="100px"
      />,
    );
    expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
      'src',
      expect.stringContaining('claro.webp'),
    );
    const source = container.querySelector('source');
    expect(source).toHaveAttribute('media', '(prefers-color-scheme: dark)');
    expect(source?.getAttribute('srcset')).toContain('oscuro.webp');
  });
});
