import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { cx } from '../../utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms, applied as transition-delay. */
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
}

/**
 * Wraps content so it fades/slides up once scrolled into view.
 * One-shot: after reveal it stays visible. No-op when reduced motion is on.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div', style }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={cx('reveal', inView && 'reveal-visible', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}
