import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { API } from '../api';

export default function ChangePassword() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', isError: true });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card">
      <h2>Change Password</h2>
      <p className="admin-card__desc">
        Update the password for your admin account.
      </p>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      <form className="admin-password-form" onSubmit={handleSubmit}>
        <label className="admin-label">Current Password</label>
        <input
          className="admin-input"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter your current password"
          required
        />

        <label className="admin-label">New Password</label>
        <input
          className="admin-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />

        <label className="admin-label">Confirm New Password</label>
        <input
          className="admin-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter the new password"
          required
        />

        <div className="admin-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
