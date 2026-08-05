import type { ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-secondary';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  withCaret?: boolean;
  className?: string;
}

export function Button({
  children, href, onClick, variant = 'primary', size = 'md', withCaret = false, className = '',
}: Props) {
  const cls = `al-btn al-btn--${variant} al-btn--${size} ${className}`.trim();
  const inner = (
    <>
      {children}
      {withCaret && <i className="al-btn__caret" aria-hidden="true" />}
    </>
  );

  if (href) {
    return <a className={cls} href={href}>{inner}</a>;
  }
  return <button type="button" className={cls} onClick={onClick}>{inner}</button>;
}
