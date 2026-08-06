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
  /**
   * Defaults to "button" so a Button dropped inside a <form> cannot submit it by accident
   * — the HTML default is "submit", which is the wrong default for a component used
   * mostly for navigation. A form's own submit control passes type="submit" explicitly.
   */
  type?: 'button' | 'submit';
}

export function Button({
  children, href, onClick, variant = 'primary', size = 'md', withCaret = false, className = '',
  type = 'button',
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
  return <button type={type} className={cls} onClick={onClick}>{inner}</button>;
}
