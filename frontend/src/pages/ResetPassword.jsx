import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import './Login.css';

import { API } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
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
          <h2>{done ? 'Password Updated' : 'Set New Password'}</h2>
          <p>{done ? 'You can now sign in with your new password.' : 'Choose a new password for your account.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {done ? (
          <Button variant="primary" size="lg" href="/login" className="auth-form__btn">
            Go to Sign In
          </Button>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="auth-form__group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                placeholder="Re-enter your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button variant="primary" size="lg" type="submit" className="auth-form__btn" disabled={sending}>
              {sending ? 'Resetting...' : 'Reset Password'}
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
