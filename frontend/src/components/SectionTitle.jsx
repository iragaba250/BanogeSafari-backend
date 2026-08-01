import './SectionTitle.css';

export default function SectionTitle({ subtitle, title, description, light = false, center = true }) {
  return (
    <div className={`section-title ${center ? 'section-title--center' : ''} ${light ? 'section-title--light' : ''}`}>
      {subtitle && <span className="section-title__subtitle">{subtitle}</span>}
      {title && <h2 className="section-title__title">{title}</h2>}
      {description && <p className="section-title__desc">{description}</p>}
    </div>
  );
}
