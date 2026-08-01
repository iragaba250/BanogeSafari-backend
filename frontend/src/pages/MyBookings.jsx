import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatPrice } from '../siteDefaults';
import Button from '../components/Button';
import './MyBookings.css';

import { API } from '../api';

export default function MyBookings() {
  const { user, token } = useAuth();
  const { site } = useSettings();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/bookings/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => setError('Could not load your bookings. Please try again.'));
  }, [token]);

  if (!user) {
    return (
      <section className="section my-bookings">
        <div className="container">
          <div className="my-bookings__locked">
            <h2>Please Sign In</h2>
            <p>You need to be logged in to view your bookings.</p>
            <Button variant="primary" size="lg" href="/login">
              Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section my-bookings">
      <div className="container">
        <div className="my-bookings__header">
          <div>
            <h1>My Bookings</h1>
            <p>Track the status of your tour reservations.</p>
          </div>
          <Button variant="primary" size="lg" href="/bookings/new">
            Book a Tour
          </Button>
        </div>

        {error && <div className="my-bookings__error">{error}</div>}

        {bookings.length === 0 ? (
          <div className="my-bookings__empty">
            <h3>No bookings yet</h3>
            <p>Browse our tours and book your next adventure.</p>
            <Button variant="primary" href="/tours">
              Explore Tours
            </Button>
          </div>
        ) : (
          <div className="my-bookings__grid">
            {bookings.map((b) => (
              <div className="my-bookings__card" key={b._id}>
                <div className="my-bookings__card-head">
                  <h3>{b.tour?.title || 'Tour'}</h3>
                  <span className={`my-bookings__status my-bookings__status--${b.status}`}>
                    {b.status}
                  </span>
                </div>
                <p className="my-bookings__location">{b.tour?.location}</p>
                <div className="my-bookings__meta">
                  <span>
                    <strong>Date</strong> {new Date(b.date).toLocaleDateString()}
                  </span>
                  <span>
                    <strong>Guests</strong> {b.guests}
                  </span>
                  <span>
                    <strong>Total</strong> {formatPrice(b.totalPrice, site.currency)}
                  </span>
                  <span>
                    <strong>Payment</strong> {b.paymentMethod}
                  </span>
                </div>
                {b.notes && <p className="my-bookings__notes">Note: {b.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
