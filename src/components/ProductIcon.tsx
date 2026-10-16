import {
  ArrowsClockwise,
  ArrowsLeftRight,
  Briefcase,
  Calculator,
  CalendarCheck,
  ChartLineUp,
  ChatCircleDots,
  ClipboardText,
  FileArrowDown,
  FileDashed,
  FileMagnifyingGlass,
  Files,
  ImageSquare,
  ListNumbers,
  Microphone,
  Scales,
  type Icon,
} from '@phosphor-icons/react';
import type { ProductIconName } from '../data/product';
import './ProductIcon.css';

const ICONS: Record<ProductIconName, Icon> = {
  intake: ClipboardText,
  assistant: ChatCircleDots,
  chronology: ListNumbers,
  significance: FileMagnifyingGlass,
  'missing-records': FileDashed,
  qme: Scales,
  damages: Calculator,
  demand: FileArrowDown,
  'case-value': ChartLineUp,
  negotiation: ArrowsLeftRight,
  'case-summary': Briefcase,
  conflicts: ArrowsClockwise,
  deadlines: CalendarCheck,
  illustrations: ImageSquare,
  discovery: Files,
  deposition: Microphone,
};

type ProductIconSize = 'menu' | 'card' | 'hero';

export function ProductIcon({
  featureId,
  icon,
  size,
}: {
  featureId: string;
  icon: ProductIconName;
  size: ProductIconSize;
}) {
  const Glyph = ICONS[icon];

  return (
    <span
      className={`al-product-icon al-product-icon--${size}`}
      data-testid={`product-icon-${featureId}`}
      aria-hidden="true"
    >
      <Glyph weight="regular" />
    </span>
  );
}
