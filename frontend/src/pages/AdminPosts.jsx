import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './AdminPosts.css';

import { API } from '../api';

const categories = ['general', 'news', 'tips', 'stories'];

const emptyForm = {
  title: '',
  category: 'general',
  excerpt: '',
  content: '',
  image: '',
  author: '',
  published: true,
};

export default function AdminPosts() {
  const { token } = useAuth();
  const fileRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchPosts = () => {
    fetch(`${API}/api/posts`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  };

  useEffect(fetchPosts, []);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (post) => {
    setForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt || '',
      content: post.content,
      image: post.image || '',
      author: post.author || '',
      published: !!post.published,
    });
    setEditingId(post._id);
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
      const res = await fetch(`${API}/api/upload/tour?prefix=post`, {
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
      category: form.category,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      image: form.image.trim(),
      author: form.author.trim() || 'BANOGE Safari',
      published: form.published,
    };

    try {
      const res = await fetch(`${API}/api/posts${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify(editingId ? 'Post updated successfully' : 'Post created successfully');
      cancelForm();
      fetchPosts();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete post "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post._id);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Post deleted');
      fetchPosts();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-posts">
      <div className="admin-posts__header">
        <div>
          <h2>Manage Blog</h2>
          <p className="admin-posts__desc">Create, edit, or remove blog posts.</p>
        </div>
        <Button variant="primary" onClick={startAdd}>
          + Create Post
        </Button>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="admin-posts__form-card">
          <h3>{editingId ? 'Edit Post' : 'Create New Post'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="admin-posts__grid">
              <div className="admin-posts__field admin-posts__field--full">
                <label className="admin-label">Title *</label>
                <input
                  className="admin-input admin-posts__input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Top 5 Safari Destinations in 2026"
                />
              </div>

              <div className="admin-posts__field admin-posts__field--full">
                <label className="admin-label">Image</label>
                <div className="admin-posts__image-row">
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
                    className="admin-posts__file"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                  />
                  <Button variant="secondary" onClick={uploadImage} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                {form.image && (
                  <div className="admin-posts__preview">
                    <img src={form.image} alt="Post preview" />
                  </div>
                )}
              </div>

              <div className="admin-posts__field">
                <label className="admin-label">Category *</label>
                <select
                  className="admin-input admin-posts__input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-posts__field">
                <label className="admin-label">Author</label>
                <input
                  className="admin-input admin-posts__input"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="BANOGE Safari"
                />
              </div>

              <div className="admin-posts__field admin-posts__field--full">
                <label className="admin-label">Excerpt</label>
                <textarea
                  className="admin-input admin-posts__textarea"
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Short summary shown in post cards (optional)"
                />
              </div>

              <div className="admin-posts__field admin-posts__field--full">
                <label className="admin-label">Content *</label>
                <textarea
                  className="admin-input admin-posts__textarea"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows="10"
                  placeholder="Write the full blog post here..."
                />
              </div>

              <div className="admin-posts__field admin-posts__field--full">
                <label className="admin-posts__checkbox">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                  />
                  Published (visible on the blog)
                </label>
              </div>
            </div>

            <div className="admin-posts__actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Post'}
              </Button>
              <Button variant="secondary" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="admin-posts__empty">No posts yet. Click “Create Post” to write your first one.</p>
      ) : (
        <div className="admin-posts__list">
          <div className="admin-posts__row admin-posts__row--head">
            <span className="admin-posts__cell admin-posts__cell--image">Image</span>
            <span className="admin-posts__cell">Title</span>
            <span className="admin-posts__cell">Category</span>
            <span className="admin-posts__cell">Status</span>
            <span className="admin-posts__cell">Updated</span>
            <span className="admin-posts__cell admin-posts__cell--actions">Actions</span>
          </div>

          {posts.map((post) => (
            <div className="admin-posts__row" key={post._id}>
              <span className="admin-posts__cell admin-posts__cell--image">
                {post.image ? (
                  <img className="admin-posts__thumb" src={post.image} alt={post.title} />
                ) : (
                  <span className="admin-posts__no-image">No image</span>
                )}
              </span>
              <span className="admin-posts__cell admin-posts__cell--title">{post.title}</span>
              <span className="admin-posts__cell">{post.category}</span>
              <span className="admin-posts__cell">
                <span
                  className={`admin-posts__status ${
                    post.published ? 'admin-posts__status--published' : ''
                  }`}
                >
                  {post.published ? 'published' : 'draft'}
                </span>
              </span>
              <span className="admin-posts__cell">
                {new Date(post.updatedAt).toLocaleDateString()}
              </span>
              <span className="admin-posts__cell admin-posts__cell--actions">
                <button className="admin-posts__btn admin-posts__btn--edit" onClick={() => startEdit(post)}>
                  Edit
                </button>
                <button
                  className="admin-posts__btn admin-posts__btn--delete"
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post._id}
                >
                  {deleting === post._id ? 'Deleting...' : 'Delete'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
