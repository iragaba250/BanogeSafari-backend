import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', href, onClick, className = '', ...props }) {
  const classes = `btn btn--${variant} btn--${size} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
