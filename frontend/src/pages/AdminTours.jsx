import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './AdminTours.css';

import { API } from '../api';

const emptyForm = {
  title: '',
  location: '',
  description: '',
  duration: '',
  price: '',
  rating: '',
  category: 'trekking',
  image: '',
  featured: false,
  maxGroupSize: '',
};

export default function AdminTours() {
  const { token } = useAuth();
  const fileRef = useRef(null);
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchTours = () => {
    fetch(`${API}/api/tours`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setTours(data.tours || []))
      .catch(() => {});
  };

  useEffect(fetchTours, [token]);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (tour) => {
    setForm({
      title: tour.title,
      location: tour.location,
      description: tour.description,
      duration: tour.duration,
      price: tour.price,
      rating: tour.rating ?? '',
      category: tour.category,
      image: tour.image || '',
      featured: !!tour.featured,
      maxGroupSize: tour.maxGroupSize ?? '',
    });
    setEditingId(tour._id || tour.id);
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

  const uploadImage = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=tour`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((f) => ({ ...f, image: data.url }));
      notify('Image uploaded');
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
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      price: Number(form.price),
      rating: form.rating === '' ? undefined : Number(form.rating),
      category: form.category,
      image: form.image.trim(),
      featured: form.featured,
      maxGroupSize: form.maxGroupSize === '' ? undefined : Number(form.maxGroupSize),
    };

    try {
      const res = await fetch(`${API}/api/tours${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify(editingId ? 'Tour updated successfully' : 'Tour created successfully');
      cancelForm();
      fetchTours();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tour) => {
    if (!window.confirm(`Delete tour "${tour.title}"? This cannot be undone.`)) return;
    setDeleting(tour._id || tour.id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/tours/${tour._id || tour.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Tour deleted');
      fetchTours();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-tours">
      <div className="admin-tours__header">
        <div>
          <h2>Manage Tours</h2>
          <p className="admin-tours__desc">
            Add, edit, or remove the tours shown on your website.
          </p>
        </div>
        <Button variant="primary" onClick={startAdd}>
          + Add Tour
        </Button>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="admin-tours__form-card">
          <h3>{editingId ? 'Edit Tour' : 'Add New Tour'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="admin-tours__grid">
              <div className="admin-tours__field">
                <label className="admin-label">Title *</label>
                <input
                  className="admin-input admin-tours__input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Himalayan Explorer"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Location *</label>
                <input
                  className="admin-input admin-tours__input"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Nepal"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Duration *</label>
                <input
                  className="admin-input admin-tours__input"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 12 Days"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Category *</label>
                <select
                  className="admin-input admin-tours__input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="trekking">Trekking</option>
                  <option value="beach">Beach</option>
                  <option value="cultural">Cultural</option>
                  <option value="safari">Safari</option>
                </select>
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Price (USD) *</label>
                <input
                  className="admin-input admin-tours__input"
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 2499"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Rating (0 - 5)</label>
                <input
                  className="admin-input admin-tours__input"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="e.g. 4.8"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Max Group Size</label>
                <input
                  className="admin-input admin-tours__input"
                  name="maxGroupSize"
                  type="number"
                  min="1"
                  value={form.maxGroupSize}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                />
              </div>

              <div className="admin-tours__field">
                <label className="admin-label">Featured</label>
                <label className="admin-tours__checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                  />
                  Show on homepage
                </label>
              </div>

              <div className="admin-tours__field admin-tours__field--full">
                <label className="admin-label">Description *</label>
                <textarea
                  className="admin-input admin-tours__textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe the tour experience..."
                />
              </div>

              <div className="admin-tours__field admin-tours__field--full">
                <label className="admin-label">Image</label>
                <div className="admin-tours__image-row">
                  <input
                    className="admin-input"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="Paste image URL"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    className="admin-tours__file"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                  />
                  <Button variant="secondary" onClick={uploadImage} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                {form.image && (
                  <div className="admin-tours__preview">
                    <img src={form.image} alt="Tour preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="admin-tours__actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Tour'}
              </Button>
              <Button variant="secondary" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {tours.length === 0 ? (
        <p className="admin-tours__empty">No tours yet. Click “Add Tour” to create your first one.</p>
      ) : (
        <div className="admin-tours__list">
          <div className="admin-tours__row admin-tours__row--head">
            <span className="admin-tours__cell admin-tours__cell--image">Image</span>
            <span className="admin-tours__cell">Title</span>
            <span className="admin-tours__cell">Location</span>
            <span className="admin-tours__cell">Category</span>
            <span className="admin-tours__cell">Price</span>
            <span className="admin-tours__cell admin-tours__cell--actions">Actions</span>
          </div>

          {tours.map((tour) => (
            <div className="admin-tours__row" key={tour._id || tour.id}>
              <span className="admin-tours__cell admin-tours__cell--image">
                {tour.image ? (
                  <img className="admin-tours__thumb" src={tour.image} alt={tour.title} />
                ) : (
                  <span className="admin-tours__no-image">No image</span>
                )}
              </span>
              <span className="admin-tours__cell admin-tours__cell--title">{tour.title}</span>
              <span className="admin-tours__cell">{tour.location}</span>
              <span className="admin-tours__cell">{tour.category}</span>
              <span className="admin-tours__cell">${tour.price}</span>
              <span className="admin-tours__cell admin-tours__cell--actions">
                <button className="admin-tours__btn admin-tours__btn--edit" onClick={() => startEdit(tour)}>
                  Edit
                </button>
                <button
                  className="admin-tours__btn admin-tours__btn--delete"
                  onClick={() => handleDelete(tour)}
                  disabled={deleting === (tour._id || tour.id)}
                >
                  {deleting === (tour._id || tour.id) ? 'Deleting...' : 'Delete'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
