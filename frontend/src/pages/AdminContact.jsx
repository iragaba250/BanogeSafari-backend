import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { contactDefaults } from './contactDefaults';
import AdminMessages from './AdminMessages';
import './AdminContact.css';

import { API } from '../api';

export default function AdminContact() {
  const { token } = useAuth();
  const heroFileRef = useRef(null);
  const [contact, setContact] = useState(() => structuredClone(contactDefaults));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const loadContact = () => {
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.contact) {
          const stored = data.settings.contact;
          setContact({
            hero: { ...contactDefaults.hero, ...(stored.hero || {}) },
            info: { ...contactDefaults.info, ...(stored.info || {}) },
          });
        }
      })
      .catch(() => {});
  };

  useEffect(loadContact, [token]);

  const handleChange = (section, field) => (e) => {
    const value = e.target.value;
    setContact((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const uploadHeroImage = async () => {
    const file = heroFileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=contact`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setContact((prev) => ({ ...prev, hero: { ...prev.hero, image: data.url } }));
      notify('Image uploaded');
      heroFileRef.current.value = '';
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
      key: 'contact',
      value: {
        hero: {
          subtitle: contact.hero.subtitle.trim(),
          title: contact.hero.title.trim(),
          description: contact.hero.description.trim(),
          image: contact.hero.image.trim(),
        },
        info: {
          phone: contact.info.phone.trim(),
          email: contact.info.email.trim(),
          address: contact.info.address.trim(),
          hours: contact.info.hours.trim(),
        },
      },
    };

    try {
      const res = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Contact page saved successfully');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-contact">
      <div className="admin-contact__header">
        <div>
          <h2>Manage Contact Page</h2>
          <p className="admin-contact__desc">
            Edit the hero banner and the contact details shown on the Contact page.
          </p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      <div className="admin-contact__messages" id="admin-messages">
        <AdminMessages />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-contact__card">
          <h3>Contact Details</h3>
          <div className="admin-contact__grid">
            <div className="admin-contact__field">
              <label className="admin-label">Phone</label>
              <input
                className="admin-input"
                value={contact.info.phone}
                onChange={handleChange('info', 'phone')}
                placeholder="e.g. +1 (555) 123-4567"
              />
            </div>
            <div className="admin-contact__field">
              <label className="admin-label">Email</label>
              <input
                className="admin-input"
                type="email"
                value={contact.info.email}
                onChange={handleChange('info', 'email')}
                placeholder="e.g. hello@wanderlusttours.com"
              />
            </div>
            <div className="admin-contact__field admin-contact__field--full">
              <label className="admin-label">Office Address</label>
              <textarea
                className="admin-input admin-contact__textarea"
                value={contact.info.address}
                onChange={handleChange('info', 'address')}
                rows="2"
                placeholder="Line 1&#10;Line 2"
              />
            </div>
            <div className="admin-contact__field admin-contact__field--full">
              <label className="admin-label">Opening Hours</label>
              <textarea
                className="admin-input admin-contact__textarea"
                value={contact.info.hours}
                onChange={handleChange('info', 'hours')}
                rows="2"
                placeholder="Line 1&#10;Line 2"
              />
            </div>
          </div>
        </div>

        <div className="admin-contact__card">
          <h3>Hero Banner</h3>
          <div className="admin-contact__grid">
            <div className="admin-contact__field">
              <label className="admin-label">Subtitle</label>
              <input
                className="admin-input"
                value={contact.hero.subtitle}
                onChange={handleChange('hero', 'subtitle')}
                placeholder="e.g. Get in Touch"
              />
            </div>
            <div className="admin-contact__field">
              <label className="admin-label">Title</label>
              <input
                className="admin-input"
                value={contact.hero.title}
                onChange={handleChange('hero', 'title')}
                placeholder="e.g. Let's Plan Your Adventure"
              />
            </div>
            <div className="admin-contact__field admin-contact__field--full">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-input admin-contact__textarea"
                value={contact.hero.description}
                onChange={handleChange('hero', 'description')}
                rows="3"
                placeholder="A short intro shown under the hero title."
              />
            </div>
            <div className="admin-contact__field admin-contact__field--full">
              <label className="admin-label">Hero Background Image</label>
              <div className="admin-contact__image-row">
                <input
                  className="admin-input"
                  value={contact.hero.image}
                  onChange={handleChange('hero', 'image')}
                  placeholder="Paste image URL"
                />
                <input
                  ref={heroFileRef}
                  type="file"
                  className="admin-contact__file"
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                />
                <Button variant="secondary" onClick={uploadHeroImage} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {contact.hero.image && (
                <div className="admin-contact__preview">
                  <img src={contact.hero.image} alt="Hero preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-contact__actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Contact Page'}
          </Button>
        </div>
      </form>
    </div>
  );
}
