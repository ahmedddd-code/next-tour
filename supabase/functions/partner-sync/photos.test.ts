import { describe, expect, it } from 'vitest';
import { extractOperatorImages } from './photos.ts';

describe('extractOperatorImages', () => {
  it('decodes escaped operator markup, keeps order, and removes duplicates', () => {
    const markup = String.raw`{\u0026quot;url\u0026quot;:\u0026quot;https:\/\/cdn.operator.test\/hotel\/main.jpg\u0026quot;}
      <img src="/hotel/room.webp"><img src="/hotel/room.webp">`;

    expect(extractOperatorImages(markup, 'https://operator.test/')).toEqual([
      'https://cdn.operator.test/hotel/main.jpg',
      'https://operator.test/hotel/room.webp',
    ]);
  });

  it('does not save interface assets as tour photos', () => {
    expect(extractOperatorImages('<img src="/logo.png"><img src="/hotel/pool.jpg">', 'https://operator.test/'))
      .toEqual(['https://operator.test/hotel/pool.jpg']);
  });
});
