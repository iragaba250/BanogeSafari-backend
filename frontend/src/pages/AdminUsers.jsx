import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminUsers.css';

import { API } from '../api';

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = () => {
    fetch(`${API}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {});
  };

  useEffect(fetchUsers, [token]);

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete customer "${user.name}"? This will also remove their bookings and cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(user.id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: 'User deleted', isError: false });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <div>
          <h2>Manage Customers</h2>
          <p className="admin-users__desc">
            View all registered customers and remove accounts if needed.
          </p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <p className="admin-users__empty">No customers yet.</p>
      ) : (
        <div className="admin-users__list">
          <div className="admin-users__row admin-users__row--head">
            <span className="admin-users__cell">Customer</span>
            <span className="admin-users__cell">Role</span>
            <span className="admin-users__cell">Bookings</span>
            <span className="admin-users__cell">Joined</span>
            <span className="admin-users__cell admin-users__cell--actions">Actions</span>
          </div>

          {users.map((user) => (
            <div className="admin-users__row" key={user.id}>
              <span className="admin-users__cell">
                <span className="admin-users__name">{user.name}</span>
                <span className="admin-users__email">{user.email}</span>
              </span>
              <span className="admin-users__cell">
                <span
                  className={`admin-users__role ${
                    user.role === 'admin' ? 'admin-users__role--admin' : ''
                  }`}
                >
                  {user.role}
                </span>
              </span>
              <span className="admin-users__cell">{user.bookings}</span>
              <span className="admin-users__cell">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="admin-users__cell admin-users__cell--actions">
                {user.role === 'admin' ? (
                  <span className="admin-users__protected">Admin account</span>
                ) : (
                  <button
                    className="admin-users__btn admin-users__btn--delete"
                    onClick={() => handleDelete(user)}
                    disabled={deleting === user.id}
                  >
                    {deleting === user.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
