import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './AdminGallery.css';

import { API } from '../api';

export default function AdminGallery() {
  const { token } = useAuth();
  const fileRef = useRef(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchImages = () => {
    if (!token) return;
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.galleryImages) setImages(data.settings.galleryImages);
      })
      .catch(() => {});
  };

  useEffect(fetchImages, [token]);

  const uploadFile = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setMessage('');
    setUploading(true);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`${API}/api/upload/gallery?prefix=gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImages(data.images);
      setMessage('Image added to gallery!');
      fileRef.current.value = '';
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    setMessage('');
    try {
      const res = await fetch(`${API}/api/upload/gallery/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImages(data.images);
      setMessage('Image removed');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="admin-gallery admin-card">
      <div className="admin-gallery__header">
        <h2>Manage Gallery</h2>
        <p className="admin-gallery__desc">
          Upload photos to the site gallery. You can remove any image at any time.
        </p>
      </div>

      <label className="admin-label">Add New Image</label>
      <div className="admin-input-row">
        <input
          ref={fileRef}
          type="file"
          className="admin-file-input"
          accept=".jpg,.jpeg,.png,.webp,.avif"
        />
        <Button variant="primary" onClick={uploadFile} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="admin-gallery__grid">
          {images.map((url, i) => (
            <div key={i} className="admin-gallery__item">
              <img src={url} alt={`Gallery ${i + 1}`} loading="lazy" />
              <button
                className="admin-gallery__remove"
                onClick={() => removeImage(i)}
                aria-label={`Remove image ${i + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={`admin-message ${message.startsWith('Error') ? 'admin-message--error' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
}
