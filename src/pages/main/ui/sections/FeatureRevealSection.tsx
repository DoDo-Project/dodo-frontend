import type { ReactNode } from 'react';

import { useScrollReveal } from '../../model/useScrollReveal';

interface FeatureRevealSectionProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  visual: ReactNode;
  /** true면 좌우 배치를 뒤집음 (지그재그 레이아웃) */
  reverse?: boolean;
}

export function FeatureRevealSection({ eyebrow, title, description, visual, reverse }: FeatureRevealSectionProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 items-center gap-8 py-12 transition-all duration-700 ease-out motion-reduce:transition-none sm:py-14 md:grid-cols-2 md:gap-14 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className={reverse ? 'md:order-2' : ''}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-neutral-950 sm:text-[28px]">{title}</h3>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-neutral-600">{description}</p>
      </div>
      <div className={reverse ? 'md:order-1' : ''}>{visual}</div>
    </div>
  );
}
