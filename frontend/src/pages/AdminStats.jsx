import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminStats.css';

import { API } from '../api';

export default function AdminStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/bookings/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data.stats))
      .catch(() => setError('Could not load the report. Please try again.'));
  }, [token]);

  if (error) {
    return (
      <div className="admin-stats">
        <div className="admin-stats__header">
          <div>
            <h2>Reports</h2>
            <p className="admin-stats__desc">Overview of bookings and revenue.</p>
          </div>
        </div>
        <div className="admin-message admin-message--error">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-stats">
        <div className="admin-stats__header">
          <div>
            <h2>Reports</h2>
            <p className="admin-stats__desc">Overview of bookings and revenue.</p>
          </div>
        </div>
        <p className="admin-stats__loading">Loading report...</p>
      </div>
    );
  }

  const formatMoney = (n) => `$${Number(n || 0).toLocaleString()}`;

  const cards = [
    { label: 'Total Bookings', value: stats.totalBookings },
    { label: 'Revenue', value: formatMoney(stats.revenue) },
    { label: 'Active Bookings', value: stats.activeBookings },
    { label: 'Cancelled', value: stats.cancelledBookings },
  ];

  return (
    <div className="admin-stats">
      <div className="admin-stats__header">
        <div>
          <h2>Reports</h2>
          <p className="admin-stats__desc">Overview of bookings and revenue.</p>
        </div>
      </div>

      <div className="admin-stats__cards">
        {cards.map((card) => (
          <div className="admin-stats__card" key={card.label}>
            <span className="admin-stats__label">{card.label}</span>
            <span className="admin-stats__value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="admin-stats__status">
        <h3 className="admin-stats__subtitle">Booking Status</h3>
        <div className="admin-stats__badges">
          <span className="admin-stats__badge admin-stats__badge--pending">
            Pending: {stats.statusBreakdown.pending}
          </span>
          <span className="admin-stats__badge admin-stats__badge--confirmed">
            Confirmed: {stats.statusBreakdown.confirmed}
          </span>
          <span className="admin-stats__badge admin-stats__badge--cancelled">
            Cancelled: {stats.statusBreakdown.cancelled}
          </span>
        </div>
      </div>

      <h3 className="admin-stats__subtitle">Most Popular Tours</h3>

      {stats.popularTours.length === 0 ? (
        <p className="admin-stats__empty">No bookings yet, so no popular tours to show.</p>
      ) : (
        <div className="admin-stats__list">
          <div className="admin-stats__row admin-stats__row--head">
            <span className="admin-stats__cell admin-stats__cell--rank">#</span>
            <span className="admin-stats__cell">Tour</span>
            <span className="admin-stats__cell">Location</span>
            <span className="admin-stats__cell">Bookings</span>
            <span className="admin-stats__cell">Guests</span>
            <span className="admin-stats__cell">Revenue</span>
          </div>

          {stats.popularTours.map((item, i) => (
            <div className="admin-stats__row" key={item._id || i}>
              <span className="admin-stats__cell admin-stats__cell--rank">{i + 1}</span>
              <span className="admin-stats__cell admin-stats__cell--tour">
                {item.tour?.title || 'Deleted tour'}
              </span>
              <span className="admin-stats__cell">{item.tour?.location || '—'}</span>
              <span className="admin-stats__cell">{item.bookings}</span>
              <span className="admin-stats__cell">{item.guests}</span>
              <span className="admin-stats__cell admin-stats__cell--revenue">
                {formatMoney(item.revenue)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
