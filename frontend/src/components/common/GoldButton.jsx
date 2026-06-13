import React from 'react';

/**
 * GoldButton — reusable CTA button using the brand gold shimmer style.
 * Props:
 *  - onClick: function
 *  - href: string (renders as <a> tag)
 *  - type: "button" | "submit" (default "button")
 *  - disabled: boolean
 *  - size: "sm" | "md" | "lg" (default "md")
 *  - variant: "solid" | "outline" (default "solid")
 *  - className: additional classes
 *  - children: React node
 */
export default function GoldButton({
  onClick,
  href,
  type = 'button',
  disabled = false,
  size = 'md',
  variant = 'solid',
  className = '',
  children,
}) {
  const sizeClasses = {
    sm: 'px-6 py-3 text-[10px]',
    md: 'px-10 py-4 text-xs',
    lg: 'px-14 py-5 text-xs',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-sans font-bold tracking-widest uppercase
    rounded-none transition-all duration-500
    cursor-pointer focus:outline-none
    disabled:opacity-40 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `;

  const variantClasses =
    variant === 'outline'
      ? 'border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-charcoal'
      : 'gold-shimmer-btn text-brand-charcoal shadow-md hover:shadow-lg';

  const combinedClasses = `${baseClasses} ${variantClasses}`;

  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}