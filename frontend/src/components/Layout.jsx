/**
 * Layout.jsx
 * Reusable layout components establishing consistent 8px-grid spacing:
 * - Container: max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
 * - Section: py-16 md:py-24 lg:py-28
 * - SectionHeader: eyebrow -> heading (mt-3) -> intro paragraph (mt-4, max-w-2xl)
 */

export function Container({ className = '', children, as: Tag = 'div', ...props }) {
  return (
    <Tag className={`site-container ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Section({ id, className = '', children, 'aria-labelledby': ariaLabelledBy, as: Tag = 'section', ...props }) {
  return (
    <Tag id={id} className={`site-section ${className}`} aria-labelledby={ariaLabelledBy} {...props}>
      {children}
    </Tag>
  );
}

export function SectionHeader({ eyebrow, title, titleId, subtitle, align = 'center', className = '' }) {
  return (
    <div className={`section-header-block text-${align} ${className}`}>
      {eyebrow && (
        <div className="section-eyebrow">
          {eyebrow}
        </div>
      )}
      <h2 id={titleId} className="section-title display-font">
        {title}
      </h2>
      {subtitle && (
        <p className="section-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}
