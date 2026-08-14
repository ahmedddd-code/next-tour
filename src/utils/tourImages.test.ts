import { describe, expect, it } from 'vitest';
import { tours } from '../data/tours';
import { withUniqueTourCovers } from './tourImages';

describe('withUniqueTourCovers', () => {
  it('uses another gallery photo when a cover is already shown', () => {
    const source = tours[0];
    const result = withUniqueTourCovers([source, { ...source, id: 'second', images: [source.images[0], source.images[1]] }]);
    expect(result[1].images[0]).toBe(source.images[1]);
  });

  it('creates a stable unique fallback when every photo is already shown', () => {
    const source = tours[0];
    const result = withUniqueTourCovers([source, { ...source, id: 'second', images: [source.images[0]] }]);
    expect(result[1].images[0]).toContain('/seed/nexttour-second/');
    expect(new Set(result.map(tour => tour.images[0])).size).toBe(2);
  });
});
