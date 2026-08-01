import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatPrice } from '../siteDefaults';
import Button from '../components/Button';
import './Booking.css';

import { API } from '../api';

const steps = [
  { key: 'package', label: 'Select Package' },
  { key: 'date', label: 'Travel Date' },
  { key: 'travelers', label: 'Travelers' },
  { key: 'info', label: 'Your Details' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Confirm' },
];

const paymentMethods = [
  { value: 'card', label: 'Credit / Debit Card', desc: 'Pay securely with your card.' },
  { value: 'paypal', label: 'PayPal', desc: 'Pay using your PayPal account.' },
  { value: 'bank', label: 'Bank Transfer', desc: 'Pay via direct bank transfer.' },
  { value: 'cash', label: 'Cash on Arrival', desc: 'Pay in cash when you arrive.' },
];

const paymentLabel = (value) =>
  paymentMethods.find((m) => m.value === value)?.label || value;

export default function Booking() {
  const { user, token } = useAuth();
  const { site } = useSettings();
  const fmt = (amount) => formatPrice(amount, site.currency);
  const [tours, setTours] = useState([]);
  const [step, setStep] = useState(0);
  const [tour, setTour] = useState(null);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [info, setInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/tours`)
      .then((r) => r.json())
      .then((data) => setTours(data.tours || []))
      .catch(() => {});
  }, []);

  const displayName = info.name || user?.name || '';
  const displayEmail = info.email || user?.email || '';

  if (!user) {
    return (
      <section className="section booking-page">
        <div className="container">
          <div className="booking-locked">
            <h2>Please Sign In</h2>
            <p>You need to be logged in to book a tour.</p>
            <Button variant="primary" size="lg" href="/login">
              Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (confirmation) {
    return (
      <section className="section booking-page">
        <div className="container">
          <div className="booking-confirmation">
            <div className="booking-confirmation__check">&#10003;</div>
            <h2>Booking Confirmed!</h2>
            <p className="booking-confirmation__ref">
              Booking reference: <strong>{confirmation._id}</strong>
            </p>
            <p className="booking-confirmation__note">
              Your booking is <strong>{confirmation.status}</strong>. We will contact you at{' '}
              <strong>{confirmation.email}</strong> with more details.
            </p>

            <div className="booking-confirmation__card">
              <h3>{confirmation.tour?.title}</h3>
              <p>{confirmation.tour?.location}</p>
              <div className="booking-confirmation__meta">
                <span>Travel Date: {new Date(confirmation.date).toLocaleDateString()}</span>
                <span>Guests: {confirmation.guests}</span>
                <span>Total: {fmt(confirmation.totalPrice)}</span>
                <span>Payment: {paymentLabel(confirmation.paymentMethod)}</span>
              </div>
            </div>

            <div className="booking-confirmation__actions">
              <Button variant="primary" size="lg" href="/bookings">
                View My Bookings
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setConfirmation(null);
                  setTour(null);
                  setDate('');
                  setGuests(1);
                  setPaymentMethod('');
                  setStep(0);
                }}
              >
                Book Another Tour
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const maxGuests = tour?.maxGroupSize || 20;
  const totalPrice = tour ? tour.price * guests : 0;

  const canNext = () => {
    if (step === 0) return !!tour;
    if (step === 1) return !!date;
    if (step === 2) return guests >= 1 && guests <= maxGuests;
    if (step === 3) return displayName.trim() && displayEmail.trim();
    if (step === 4) return !!paymentMethod;
    return true;
  };

  const next = () => canNext() && setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tour: tour._id,
          date,
          guests,
          name: displayName.trim(),
          email: displayEmail.trim(),
          phone: info.phone.trim(),
          notes: info.notes.trim(),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setConfirmation(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div>
          <h2 className="booking-content__title">Choose Your Package</h2>
          <p className="booking-content__desc">Select the tour you would like to book.</p>
          <div className="booking-packages">
            {tours.map((t) => (
              <button
                key={t._id}
                className={`booking-package ${tour?._id === t._id ? 'booking-package--selected' : ''}`}
                onClick={() => setTour(t)}
                type="button"
              >
                {t.image ? (
                  <img className="booking-package__img" src={t.image} alt={t.title} />
                ) : (
                  <div className="booking-package__img booking-package__img--empty">{t.title}</div>
                )}
                <div className="booking-package__info">
                  <h3>{t.title}</h3>
                  <p className="booking-package__location">
                    {t.location} &middot; {t.duration}
                  </p>
                  <p className="booking-package__price">
                    {fmt(t.price)} <span>per person</span>
                  </p>
                </div>
                <span className="booking-package__radio">
                  {tour?._id === t._id ? '\u25C9' : '\u25CB'}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div>
          <h2 className="booking-content__title">Select Travel Date</h2>
          <p className="booking-content__desc">Pick the day you want to start your adventure.</p>
          <div className="booking-field">
            <label className="booking-field__label" htmlFor="travel-date">
              Travel Date
            </label>
            <input
              id="travel-date"
              className="booking-input"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <h2 className="booking-content__title">Number of Travelers</h2>
          <p className="booking-content__desc">
            How many people are joining this tour? (max {maxGuests})
          </p>
          <div className="booking-field">
            <label className="booking-field__label" htmlFor="guests">
              Travelers
            </label>
            <input
              id="guests"
              className="booking-input booking-input--number"
              type="number"
              min="1"
              max={maxGuests}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </div>
          <div className="booking-price-breakdown">
            <div className="booking-price-breakdown__row">
              <span>
                {tour.title} ({tour.duration})
              </span>
              <span>
                {fmt(tour.price)} x {guests}
              </span>
            </div>
            <div className="booking-price-breakdown__row booking-price-breakdown__row--total">
              <span>Total</span>
              <span>{fmt(totalPrice)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <h2 className="booking-content__title">Your Details</h2>
          <p className="booking-content__desc">We will use this information to confirm your booking.</p>
          <div className="booking-info">
            <div className="booking-field">
              <label className="booking-field__label" htmlFor="info-name">
                Full Name *
              </label>
              <input
                id="info-name"
                className="booking-input"
                type="text"
                value={displayName}
                onChange={(e) => setInfo((i) => ({ ...i, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="booking-field">
              <label className="booking-field__label" htmlFor="info-email">
                Email *
              </label>
              <input
                id="info-email"
                className="booking-input"
                type="email"
                value={displayEmail}
                onChange={(e) => setInfo((i) => ({ ...i, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className="booking-field">
              <label className="booking-field__label" htmlFor="info-phone">
                Phone
              </label>
              <input
                id="info-phone"
                className="booking-input"
                type="tel"
                value={info.phone}
                onChange={(e) => setInfo((i) => ({ ...i, phone: e.target.value }))}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="booking-field booking-field--full">
              <label className="booking-field__label" htmlFor="info-notes">
                Special Requests (optional)
              </label>
              <textarea
                id="info-notes"
                className="booking-input booking-input--textarea"
                rows="4"
                value={info.notes}
                onChange={(e) => setInfo((i) => ({ ...i, notes: e.target.value }))}
                placeholder="Dietary needs, accessibility, etc."
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div>
          <h2 className="booking-content__title">Payment Method</h2>
          <p className="booking-content__desc">Choose how you would like to pay for your tour.</p>
          <div className="booking-payments">
            {paymentMethods.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`booking-payment ${
                  paymentMethod === m.value ? 'booking-payment--selected' : ''
                }`}
                onClick={() => setPaymentMethod(m.value)}
              >
                <span className="booking-payment__radio">
                  {paymentMethod === m.value ? '\u25C9' : '\u25CB'}
                </span>
                <span className="booking-payment__info">
                  <strong>{m.label}</strong>
                  <span className="booking-payment__desc">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="booking-content__title">Review Your Booking</h2>
        <p className="booking-content__desc">Please review the details before confirming.</p>
        <div className="booking-review">
          <div className="booking-review__group">
            <span className="booking-review__label">Package</span>
            <strong>{tour.title}</strong>
            <span className="booking-review__sub">{tour.location}</span>
          </div>
          <div className="booking-review__group">
            <span className="booking-review__label">Travel Date</span>
            <strong>{new Date(date).toLocaleDateString()}</strong>
          </div>
          <div className="booking-review__group">
            <span className="booking-review__label">Travelers</span>
            <strong>{guests}</strong>
          </div>
          <div className="booking-review__group">
            <span className="booking-review__label">Lead Traveler</span>
            <strong>{displayName}</strong>
            <span className="booking-review__sub">{displayEmail}</span>
            {info.phone && <span className="booking-review__sub">{info.phone}</span>}
          </div>
          <div className="booking-review__group">
            <span className="booking-review__label">Payment Method</span>
            <strong>{paymentLabel(paymentMethod)}</strong>
          </div>
          <div className="booking-review__group booking-review__group--total">
            <span className="booking-review__label">Total Price</span>
            <strong>{fmt(totalPrice)}</strong>
            <span className="booking-review__sub">
              {fmt(tour.price)} per person x {guests}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="section booking-page">
      <div className="container">
        <div className="booking-header">
          <h1>Book Your Tour</h1>
          <p>Complete each step to confirm your adventure.</p>
        </div>

        <div className="booking-stepper">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`booking-stepper__step ${
                i === step ? 'booking-stepper__step--active' : ''
              } ${i < step ? 'booking-stepper__step--done' : ''}`}
            >
              <span className="booking-stepper__num">{i < step ? '\u2713' : i + 1}</span>
              <span className="booking-stepper__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="booking-layout">
          <div className="booking-content">{renderStep()}</div>

          <aside className="booking-summary">
            <h3>Booking Summary</h3>
            {tour ? (
              <>
                <div className="booking-summary__tour">
                  <strong>{tour.title}</strong>
                  <span>{tour.location}</span>
                </div>
                <dl className="booking-summary__rows">
                  <div>
                    <dt>Date</dt>
                    <dd>{date ? new Date(date).toLocaleDateString() : 'Not selected'}</dd>
                  </div>
                  <div>
                    <dt>Travelers</dt>
                    <dd>{guests}</dd>
                  </div>
                  <div>
                    <dt>Price / person</dt>
                    <dd>{fmt(tour.price)}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>{paymentMethod ? paymentLabel(paymentMethod) : 'Not selected'}</dd>
                  </div>
                  <div className="booking-summary__total">
                    <dt>Total</dt>
                    <dd>{fmt(totalPrice)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="booking-summary__empty">Select a package to see the summary.</p>
            )}
          </aside>
        </div>

        {error && <div className="booking-error">{error}</div>}

        <div className="booking-nav">
          <div>
            {step > 0 && (
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
            )}
          </div>
          {step < steps.length - 1 ? (
            <Button variant="primary" onClick={next} disabled={!canNext()}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
