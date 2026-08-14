import { BusinessVisual } from './VisualBusiness';
import { ProductVisual } from './VisualProduct';
import { StoryVisual } from './VisualStory';
import type { VisualKind } from './types';

const product = new Set<VisualKind>(['home','search','booking','account','ai','mobile']);
const business = new Set<VisualKind>(['admin','editor','bookings','support','analytics']);

export function SlideVisual({ kind }: { kind: VisualKind }) {
  if (product.has(kind)) return <ProductVisual kind={kind}/>;
  if (business.has(kind)) return <BusinessVisual kind={kind}/>;
  return <StoryVisual kind={kind}/>;
}
