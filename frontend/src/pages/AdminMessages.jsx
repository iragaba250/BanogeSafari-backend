import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminMessages.css';

import { API } from '../api';

export default function AdminMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const fetchMessages = () => {
    const url = filter === 'all' ? `${API}/api/contact` : `${API}/api/contact?status=${filter}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {});
  };

  useEffect(fetchMessages, [token, filter]);

  const newCount = messages.filter((m) => m.status === 'new').length;

  const toggleStatus = async (item) => {
    setUpdating(item._id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/contact/${item._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: item.status === 'new' ? 'read' : 'new' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify(item.status === 'new' ? 'Message marked as read' : 'Message marked as new');
      fetchMessages();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete message from "${item.name}"? This cannot be undone.`)) return;
    setDeleting(item._id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/contact/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Message deleted');
      if (expandedId === item._id) setExpandedId(null);
      fetchMessages();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setDeleting(null);
    }
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="admin-messages">
      <div className="admin-messages__header">
        <div>
          <h2>Contact Messages</h2>
          <p className="admin-messages__desc">
            Messages submitted by visitors through the Contact page.
          </p>
        </div>
        <div className="admin-messages__filters">
          <button
            className={`admin-messages__filter ${filter === 'all' ? 'admin-messages__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </button>
          <button
            className={`admin-messages__filter ${filter === 'new' ? 'admin-messages__filter--active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New ({newCount})
          </button>
          <button
            className={`admin-messages__filter ${filter === 'read' ? 'admin-messages__filter--active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      {messages.length === 0 ? (
        <p className="admin-messages__empty">
          {filter === 'all' ? 'No messages yet. Messages from the Contact page will appear here.' : 'No messages in this view.'}
        </p>
      ) : (
        <div className="admin-messages__list">
          {messages.map((item) => (
            <div
              className={`admin-messages__item ${item.status === 'new' ? 'admin-messages__item--new' : ''}`}
              key={item._id}
            >
              <button className="admin-messages__summary" onClick={() => toggleExpand(item._id)}>
                <span className="admin-messages__dot" />
                <span className="admin-messages__subject">{item.subject}</span>
                <span className="admin-messages__from">
                  {item.name} &lt;{item.email}&gt;
                </span>
                <span className="admin-messages__date">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
                <span className="admin-messages__chevron">{expandedId === item._id ? '▲' : '▼'}</span>
              </button>

              {expandedId === item._id && (
                <div className="admin-messages__body">
                  <p className="admin-messages__text">{item.message}</p>
                  <div className="admin-messages__actions">
                    <span className={`admin-messages__status ${item.status === 'read' ? 'admin-messages__status--read' : ''}`}>
                      {item.status === 'new' ? 'new' : 'read'}
                    </span>
                    <button
                      className="admin-messages__btn admin-messages__btn--edit"
                      onClick={() => toggleStatus(item)}
                      disabled={updating === item._id}
                    >
                      {updating === item._id ? 'Saving...' : item.status === 'new' ? 'Mark as Read' : 'Mark as New'}
                    </button>
                    <button
                      className="admin-messages__btn admin-messages__btn--delete"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item._id}
                    >
                      {deleting === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
