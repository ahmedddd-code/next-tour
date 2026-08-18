import { describe, expect, it } from 'vitest';
import { tourOperator } from './tourOperator';

describe('tourOperator', () => {
  it('returns stable public links instead of temporary B2B offer links', () => {
    expect(tourOperator('selfie', 'https://b2b.selfietravel.kz/search_tour?old=1')).toEqual({
      name: 'Selfie Travel', url: 'https://www.selfietravel.kz/',
    });
    expect(tourOperator('kompas')?.url).toBe('https://kompastour.com/kz/rus/');
    expect(tourOperator('funsun')?.url).toBe('https://fstravel.asia/');
    expect(tourOperator('pegas')?.url).toBe('https://kz.pegast.asia/');
  });

  it('uses only the safe origin for an unknown operator', () => {
    expect(tourOperator('other', 'https://operator.example/search?expired=1')).toEqual({
      name: 'other', url: 'https://operator.example/',
    });
  });
});
