import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { formatPrice } from '../siteDefaults';
import Button from '../components/Button';
import './TourDetail.css';

import { API } from '../api';

export default function TourDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { site } = useSettings();
  const initial = location.state?.tour;
  const hasInitialRef = useRef(Boolean(initial));
  const [tour, setTour] = useState(initial || null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/tours/${id}`);
        if (!res.ok) throw new Error('Tour not found');
        const data = await res.json();
        if (!cancelled) {
          setTour(data.tour);
          setNotFound(false);
        }
      } catch {
        if (!cancelled && !hasInitialRef.current) setNotFound(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return (
      <section className="section tour-detail-page">
        <div className="container">
          <div className="tour-detail__empty">
            <h3>Tour not found</h3>
            <p>The tour you are looking for does not exist.</p>
            <Button variant="primary" href="/tours">
              Browse All Tours
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!tour) {
    return (
      <section className="section tour-detail-page">
        <div className="container">
          <div className="tour-detail__empty">
            <p>Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  const categoryLabel = tour.category
    ? tour.category.charAt(0).toUpperCase() + tour.category.slice(1)
    : '';

  return (
    <section className="section tour-detail-page">
      <div className="container">
        <Link to="/tours" className="tour-detail__back-link">
          &larr; Back to Tours
        </Link>

        <div className="tour-detail__hero">
          {tour.image ? (
            <img className="tour-detail__hero-img" src={tour.image} alt={tour.title} />
          ) : (
            <div className="tour-detail__hero-img tour-detail__hero-img--empty">
              {tour.title}
            </div>
          )}
        </div>

        <div className="tour-detail__layout">
          <div className="tour-detail__main">
            {tour.category && <span className="tour-detail__category">{categoryLabel}</span>}
            <h1 className="tour-detail__title">{tour.title}</h1>
            <p className="tour-detail__location">{tour.location}</p>

            <div className="tour-detail__meta">
              <span className="tour-detail__meta-item">
                <strong>Duration</strong> {tour.duration}
              </span>
              <span className="tour-detail__meta-item">
                <strong>Rating</strong> {tour.rating || 'N/A'} &#9733;
              </span>
              <span className="tour-detail__meta-item">
                <strong>Group Size</strong> Max {tour.maxGroupSize} people
              </span>
            </div>

            <div className="tour-detail__section">
              <h2>About This Tour</h2>
              <p className="tour-detail__desc">{tour.description}</p>
            </div>

            {tour.featured && (
              <span className="tour-detail__featured">Featured Tour</span>
            )}
          </div>

          <aside className="tour-detail__sidebar">
            <div className="tour-detail__card">
              <span className="tour-detail__price-label">Price per person</span>
              <span className="tour-detail__price">{formatPrice(tour.price, site.currency)}</span>
              <Button variant="primary" size="lg" href={`/bookings/new?tour=${tour._id}`}>
                Book This Tour
              </Button>
              <p className="tour-detail__card-note">
                Free cancellation up to 48 hours before departure.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
