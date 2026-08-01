import './TestimonialCard.css';

export default function TestimonialCard({ testimonial }) {
  const { name, role, avatar, text, rating } = testimonial;

  return (
    <div className="testimonial-card">
      <div className="testimonial-card__stars">
        {Array.from({ length: rating }, (_, i) => (
          <span key={i} className="testimonial-card__star">&#9733;</span>
        ))}
      </div>
      <p className="testimonial-card__text">&ldquo;{text}&rdquo;</p>
      <div className="testimonial-card__author">
        <img src={avatar} alt={name} className="testimonial-card__avatar" loading="lazy" />
        <div>
          <div className="testimonial-card__name">{name}</div>
          <div className="testimonial-card__role">{role}</div>
        </div>
      </div>
    </div>
  );
}
