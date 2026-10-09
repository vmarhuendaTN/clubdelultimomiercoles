import { render, screen, within } from '@testing-library/react';
import { Carousel, CarouselItem } from './Carousel';

describe('Carousel', () => {
  it('es una región con título, lista y controles', () => {
    render(
      <Carousel titulo="Lo último que hemos leído">
        <CarouselItem>Uno</CarouselItem>
        <CarouselItem>Dos</CarouselItem>
      </Carousel>,
    );
    const region = screen.getByRole('region', { name: 'Lo último que hemos leído' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
    expect(within(region).getByRole('button', { name: 'Siguientes' })).toBeInTheDocument();
    expect(within(region).getByRole('button', { name: 'Anteriores' })).toBeInTheDocument();
  });
});
