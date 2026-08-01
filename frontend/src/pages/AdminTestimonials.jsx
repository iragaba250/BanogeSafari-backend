import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './AdminTestimonials.css';

import { API } from '../api';

const emptyForm = {
  name: '',
  role: '',
  avatar: '',
  text: '',
  rating: 5,
  published: true,
};

export default function AdminTestimonials() {
  const { token } = useAuth();
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchItems = () => {
    fetch(`${API}/api/testimonials?all=true`)
      .then((r) => r.json())
      .then((data) => setItems(data.testimonials || []))
      .catch(() => {});
  };

  useEffect(fetchItems, []);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (item) => {
    setForm({
      name: item.name,
      role: item.role || '',
      avatar: item.avatar || '',
      text: item.text,
      rating: item.rating ?? 5,
      published: !!item.published,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadAvatar = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=testimonial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((f) => ({ ...f, avatar: data.url }));
      notify('Avatar uploaded');
      fileRef.current.value = '';
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      avatar: form.avatar.trim(),
      text: form.text.trim(),
      rating: Number(form.rating),
      published: form.published,
    };

    try {
      const res = await fetch(`${API}/api/testimonials${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify(editingId ? 'Testimonial updated successfully' : 'Testimonial created successfully');
      cancelForm();
      fetchItems();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete testimonial from "${item.name}"? This cannot be undone.`)) return;
    setDeleting(item._id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/testimonials/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Testimonial deleted');
      fetchItems();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-testimonials">
      <div className="admin-testimonials__header">
        <div>
          <h2>Manage Testimonials</h2>
          <p className="admin-testimonials__desc">Add, edit, or remove the testimonials shown on the homepage.</p>
        </div>
        <Button variant="primary" onClick={startAdd}>
          + Add Testimonial
        </Button>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="admin-testimonials__form-card">
          <h3>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="admin-testimonials__grid">
              <div className="admin-testimonials__field">
                <label className="admin-label">Name *</label>
                <input
                  className="admin-input admin-testimonials__input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Sarah Johnson"
                />
              </div>

              <div className="admin-testimonials__field">
                <label className="admin-label">Role</label>
                <input
                  className="admin-input admin-testimonials__input"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Adventure Seeker"
                />
              </div>

              <div className="admin-testimonials__field">
                <label className="admin-label">Rating (1 - 5)</label>
                <input
                  className="admin-input admin-testimonials__input"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>

              <div className="admin-testimonials__field">
                <label className="admin-label">Avatar</label>
                <div className="admin-testimonials__image-row">
                  <input
                    className="admin-input"
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    placeholder="Paste image URL"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    className="admin-testimonials__file"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                  />
                  <Button variant="secondary" onClick={uploadAvatar} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                {form.avatar && (
                  <div className="admin-testimonials__preview">
                    <img src={form.avatar} alt="Avatar preview" />
                  </div>
                )}
              </div>

              <div className="admin-testimonials__field admin-testimonials__field--full">
                <label className="admin-label">Testimonial Text *</label>
                <textarea
                  className="admin-input admin-testimonials__textarea"
                  name="text"
                  value={form.text}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="What did the traveler say about their experience?"
                />
              </div>

              <div className="admin-testimonials__field admin-testimonials__field--full">
                <label className="admin-testimonials__checkbox">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                  />
                  Published (visible on the homepage)
                </label>
              </div>
            </div>

            <div className="admin-testimonials__actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Testimonial'}
              </Button>
              <Button variant="secondary" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <p className="admin-testimonials__empty">
          No testimonials yet. Click “Add Testimonial” to create your first one.
        </p>
      ) : (
        <div className="admin-testimonials__list">
          <div className="admin-testimonials__row admin-testimonials__row--head">
            <span className="admin-testimonials__cell admin-testimonials__cell--avatar">Avatar</span>
            <span className="admin-testimonials__cell">Name</span>
            <span className="admin-testimonials__cell">Rating</span>
            <span className="admin-testimonials__cell">Status</span>
            <span className="admin-testimonials__cell">Updated</span>
            <span className="admin-testimonials__cell admin-testimonials__cell--actions">Actions</span>
          </div>

          {items.map((item) => (
            <div className="admin-testimonials__row" key={item._id}>
              <span className="admin-testimonials__cell admin-testimonials__cell--avatar">
                {item.avatar ? (
                  <img className="admin-testimonials__thumb" src={item.avatar} alt={item.name} />
                ) : (
                  <span className="admin-testimonials__no-image">No image</span>
                )}
              </span>
              <span className="admin-testimonials__cell admin-testimonials__cell--name">{item.name}</span>
              <span className="admin-testimonials__cell">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
              <span className="admin-testimonials__cell">
                <span
                  className={`admin-testimonials__status ${
                    item.published ? 'admin-testimonials__status--published' : ''
                  }`}
                >
                  {item.published ? 'published' : 'hidden'}
                </span>
              </span>
              <span className="admin-testimonials__cell">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
              <span className="admin-testimonials__cell admin-testimonials__cell--actions">
                <button className="admin-testimonials__btn admin-testimonials__btn--edit" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button
                  className="admin-testimonials__btn admin-testimonials__btn--delete"
                  onClick={() => handleDelete(item)}
                  disabled={deleting === item._id}
                >
                  {deleting === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
