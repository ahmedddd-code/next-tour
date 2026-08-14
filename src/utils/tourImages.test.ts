import { describe, expect, it } from 'vitest';
import { tours } from '../data/tours';
import { completeTourGallery, withUniqueTourCovers } from './tourImages';

describe('withUniqueTourCovers', () => {
  it('uses another gallery photo when a cover is already shown', () => {
    const source = tours[0];
    const result = withUniqueTourCovers([source, { ...source, id: 'second', images: [source.images[0], source.images[1]] }]);
    expect(result[1].coverImage).not.toBe(result[0].coverImage);
  });

  it('creates a stable unique fallback when every photo is already shown', () => {
    const source = tours[0];
    const result = withUniqueTourCovers([source, { ...source, id: 'second', images: [source.images[0]] }]);
    expect(result[1].coverImage).not.toBe(result[0].coverImage);
    expect(new Set(result.map(tour => tour.coverImage)).size).toBe(2);
  });

  it('adds a destination photo and at least two hotel photos to every tour', () => {
    const gallery = completeTourGallery({ ...tours[0], images: [tours[0].images[0]] });
    expect(gallery).toHaveLength(3);
    expect(new Set(gallery).size).toBe(3);
  });
});
