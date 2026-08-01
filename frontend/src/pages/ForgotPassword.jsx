import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import './Login.css';

import { API } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>Forgot Password</h2>
          <p>Enter your account email to receive a reset link</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {result ? (
          <div className="auth-success">
            <p>{result.message}</p>
            {result.resetToken && (
              <div className="auth-success__box">
                <p>
                  Reset link: <Link to={result.resetUrl}>{result.resetUrl}</Link>
                </p>
                <p className="auth-success__hint">
                  In a live deployment this link would be sent to your email.
                </p>
              </div>
            )}
            <Button variant="primary" size="lg" href="/login" className="auth-form__btn">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button variant="primary" size="lg" type="submit" className="auth-form__btn" disabled={sending}>
              {sending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <p className="auth-card__footer">
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
