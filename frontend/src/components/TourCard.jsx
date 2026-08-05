import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { formatPrice } from '../siteDefaults';
import './TourCard.css';

export default function TourCard({ tour }) {
  const { site } = useSettings();
  const { image, title, location, duration, price, rating, description } = tour;
  const id = tour._id || tour.id;

  return (
    <Link to={`/tours/${id}`} state={{ tour }} className="tour-card">
      <div className="tour-card__image">
        <img src={image} alt={title} loading="lazy" />
        <span className="tour-card__duration">{duration}</span>
      </div>
      <div className="tour-card__body">
        <div className="tour-card__location">{location}</div>
        <h3 className="tour-card__title">{title}</h3>
        <p className="tour-card__desc">{description}</p>
        <div className="tour-card__footer">
          <div className="tour-card__rating">
            <span className="tour-card__star">&#9733;</span>
            <span>{rating}</span>
          </div>
          <div className="tour-card__price">
            <span className="tour-card__price-label">from</span>
            <span className="tour-card__price-value">{formatPrice(price, site.currency)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
