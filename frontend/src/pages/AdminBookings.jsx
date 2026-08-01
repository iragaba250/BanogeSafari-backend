import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminBookings.css';

import { API } from '../api';

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchBookings = () => {
    fetch(`${API}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => {});
  };

  useEffect(fetchBookings, [token]);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const updateStatus = async (booking, status) => {
    if (status === 'cancelled') {
      if (!window.confirm(`Cancel the booking for "${booking.tour?.title}"?`)) return;
    }
    setUpdating(booking._id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/bookings/${booking._id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify(`Booking ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`);
      fetchBookings();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUpdating(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="admin-bookings">
        <div className="admin-bookings__header">
          <div>
            <h2>Manage Bookings</h2>
            <p className="admin-bookings__desc">Review, confirm, or cancel customer bookings.</p>
          </div>
        </div>
        {message && (
          <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
            {message.text}
          </div>
        )}
        <p className="admin-bookings__empty">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      <div className="admin-bookings__header">
        <div>
          <h2>Manage Bookings</h2>
          <p className="admin-bookings__desc">Review, confirm, or cancel customer bookings.</p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      <div className="admin-bookings__list">
        <div className="admin-bookings__row admin-bookings__row--head">
          <span className="admin-bookings__cell">Customer</span>
          <span className="admin-bookings__cell">Tour</span>
          <span className="admin-bookings__cell">Date</span>
          <span className="admin-bookings__cell">Guests</span>
          <span className="admin-bookings__cell">Total</span>
          <span className="admin-bookings__cell">Status</span>
          <span className="admin-bookings__cell admin-bookings__cell--actions">Actions</span>
        </div>

        {bookings.map((booking) => (
          <div className="admin-bookings__item" key={booking._id}>
            <div className="admin-bookings__row">
              <span className="admin-bookings__cell">
                <span className="admin-bookings__customer">{booking.user?.name || 'Unknown'}</span>
                <span className="admin-bookings__email">{booking.user?.email}</span>
              </span>
              <span className="admin-bookings__cell admin-bookings__cell--tour">
                {booking.tour?.title || 'Unknown tour'}
              </span>
              <span className="admin-bookings__cell">
                {new Date(booking.date).toLocaleDateString()}
              </span>
              <span className="admin-bookings__cell">{booking.guests}</span>
              <span className="admin-bookings__cell">
                ${booking.totalPrice}
                <span className="admin-bookings__payment">{booking.paymentMethod}</span>
              </span>
              <span className="admin-bookings__cell">
                <span className={`admin-bookings__status admin-bookings__status--${booking.status}`}>
                  {booking.status}
                </span>
              </span>
              <span className="admin-bookings__cell admin-bookings__cell--actions">
                {booking.status === 'pending' && (
                  <button
                    className="admin-bookings__btn admin-bookings__btn--confirm"
                    onClick={() => updateStatus(booking, 'confirmed')}
                    disabled={updating === booking._id}
                  >
                    Confirm
                  </button>
                )}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    className="admin-bookings__btn admin-bookings__btn--cancel"
                    onClick={() => updateStatus(booking, 'cancelled')}
                    disabled={updating === booking._id}
                  >
                    Cancel
                  </button>
                )}
              </span>
            </div>
            {booking.notes && (
              <div className="admin-bookings__note">
                <span className="admin-bookings__note-label">Special Request:</span>
                <span className="admin-bookings__note-text">{booking.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
