import { describe, expect, it } from 'vitest';
import { tours } from '../data/tours';
import { completeTourGallery, withUniqueTourCovers } from './tourImages';

describe('withUniqueTourCovers', () => {
  it('keeps exact partner photos even when another card uses the same URL', () => {
    const source = tours[0];
    const partner = { ...source, id: 'partner-one', partnerSource: 'kompas', externalOfferId: 'offer-1', images: [source.images[0], source.images[1]] };
    const result = withUniqueTourCovers([partner, { ...partner, id: 'partner-two', externalOfferId: 'offer-2' }]);
    expect(result[1].coverImage).toBe(result[0].coverImage);
    expect(result[1].images).toEqual(partner.images);
  });

  it('uses a real destination photo when a partner has no photos', () => {
    const source = tours[0];
    const result = withUniqueTourCovers([{ ...source, partnerSource: 'selfie', externalOfferId: 'offer-1', images: [] }]);
    expect(result[0].images[0]).toMatch(/^https:\/\//);
    expect(result[0].coverImage).not.toContain('tour-placeholder.svg');
  });

  it('still completes the gallery for manually managed tours', () => {
    const gallery = completeTourGallery({ ...tours[0], images: [tours[0].images[0]] });
    expect(gallery).toHaveLength(3);
    expect(new Set(gallery).size).toBe(3);
  });
});
