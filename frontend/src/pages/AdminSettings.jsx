import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { siteDefaults, deepMerge, isImageUrl } from '../siteDefaults';
import { contactDefaults } from './contactDefaults';
import Button from '../components/Button';
import './AdminSettings.css';

import { API } from '../api';

const emptyStat = { number: '', label: '' };
const socialKeys = ['instagram', 'twitter', 'youtube', 'facebook'];

export default function AdminSettings() {
  const { token } = useAuth();
  const logoFileRef = useRef(null);
  const [site, setSite] = useState(() => structuredClone(siteDefaults));
  const [contact, setContact] = useState(() => structuredClone(contactDefaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState(null);

  const notify = (text, isError = false) => setMessage({ text, isError });

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const map = data.settings || {};
        if (map.site) setSite((prev) => deepMerge(prev, map.site));
        if (map.contact) {
          const stored = map.contact;
          setContact({
            hero: { ...contactDefaults.hero, ...(stored.hero || {}) },
            info: { ...contactDefaults.info, ...(stored.info || {}) },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSite = (section, field) => (e) => {
    const value = e.target.value;
    setSite((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleTop = (field) => (e) => {
    const value = e.target.value;
    setSite((prev) => ({ ...prev, [field]: value }));
  };

  const uploadLogo = async () => {
    const file = logoFileRef.current?.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSite((prev) => ({ ...prev, logoIcon: data.url }));
      notify('Logo uploaded. Click “Save Site Settings” to apply it.');
      logoFileRef.current.value = '';
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleStat = (index, field) => (e) => {
    const value = e.target.value;
    setSite((prev) => {
      const stats = prev.stats.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, stats };
    });
  };

  const addStat = () => {
    setSite((prev) => ({ ...prev, stats: [...prev.stats, { ...emptyStat }] }));
  };

  const removeStat = (index) => {
    setSite((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const handleSocial = (field) => (e) => {
    const value = e.target.value;
    setSite((prev) => ({ ...prev, social: { ...prev.social, [field]: value } }));
  };

  const handleContact = (field) => (e) => {
    const value = e.target.value;
    setContact((prev) => ({ ...prev, info: { ...prev.info, [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      settings: {
        site: {
          name: site.name.trim(),
          logoIcon: site.logoIcon.trim(),
          tagline: site.tagline.trim(),
          currency: site.currency.trim(),
          hero: {
            badge: site.hero.badge.trim(),
            title: site.hero.title.trim(),
            highlight: site.hero.highlight.trim(),
            titleEnd: site.hero.titleEnd.trim(),
            subtitle: site.hero.subtitle.trim(),
            primaryButton: site.hero.primaryButton.trim(),
            primaryButtonLink: site.hero.primaryButtonLink.trim(),
            secondaryButton: site.hero.secondaryButton.trim(),
            secondaryButtonLink: site.hero.secondaryButtonLink.trim(),
          },
          stats: site.stats
            .map((s) => ({ number: s.number.trim(), label: s.label.trim() }))
            .filter((s) => s.label || s.number),
          footer: {
            description: site.footer.description.trim(),
            copyright: site.footer.copyright.trim(),
          },
          social: Object.fromEntries(
            socialKeys.map((k) => [k, (site.social?.[k] || '').trim()])
          ),
        },
        contact: {
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
      },
    };

    try {
      const res = await fetch(`${API}/api/settings/bulk`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notify('Site settings saved successfully');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings">
        <p className="admin-settings__desc">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <div>
          <h2>General Site Settings</h2>
          <p className="admin-settings__desc">
            Configure the brand, homepage hero, stats, footer, social links, currency, and
            contact details used across the website.
          </p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-settings__card">
          <h3>Branding</h3>
          <div className="admin-settings__grid">
            <div className="admin-settings__field">
              <label className="admin-label">Site Name</label>
              <input
                className="admin-input"
                value={site.name}
                onChange={handleTop('name')}
                placeholder="e.g. BANOGE safari"
              />
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Logo</label>
              <div className="admin-settings__logo-row">
                <input
                  className="admin-input"
                  value={site.logoIcon}
                  onChange={handleTop('logoIcon')}
                  placeholder="Paste an image URL or use an emoji (e.g. 🏕)"
                />
                <input
                  ref={logoFileRef}
                  type="file"
                  className="admin-settings__file"
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={uploadLogo}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </div>
              {site.logoIcon && (
                <div className="admin-settings__logo-preview">
                  {isImageUrl(site.logoIcon) ? (
                    <img src={site.logoIcon} alt="Logo preview" />
                  ) : (
                    <span>{site.logoIcon}</span>
                  )}
                  <span className="admin-settings__logo-preview-label">
                    Logo preview (JPG, PNG, WebP, AVIF)
                  </span>
                </div>
              )}
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Tagline</label>
              <textarea
                className="admin-input admin-settings__textarea"
                value={site.tagline}
                onChange={handleTop('tagline')}
                rows="2"
                placeholder="Short description of your company"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Currency</label>
              <input
                className="admin-input"
                value={site.currency}
                onChange={handleTop('currency')}
                placeholder="e.g. USD, EUR, GBP, RWF, KES"
              />
            </div>
          </div>
        </div>

        <div className="admin-settings__card">
          <h3>Homepage Hero</h3>
          <div className="admin-settings__grid">
            <div className="admin-settings__field">
              <label className="admin-label">Badge</label>
              <input
                className="admin-input"
                value={site.hero.badge}
                onChange={handleSite('hero', 'badge')}
                placeholder="e.g. Adventure Awaits"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Title (before highlight)</label>
              <input
                className="admin-input"
                value={site.hero.title}
                onChange={handleSite('hero', 'title')}
                placeholder="e.g. Discover the World's"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Highlighted Words</label>
              <input
                className="admin-input"
                value={site.hero.highlight}
                onChange={handleSite('hero', 'highlight')}
                placeholder="e.g. Most Beautiful"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Title (after highlight)</label>
              <input
                className="admin-input"
                value={site.hero.titleEnd}
                onChange={handleSite('hero', 'titleEnd')}
                placeholder="e.g. Places"
              />
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Subtitle</label>
              <textarea
                className="admin-input admin-settings__textarea"
                value={site.hero.subtitle}
                onChange={handleSite('hero', 'subtitle')}
                rows="3"
                placeholder="Supporting text under the hero title"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Primary Button Text</label>
              <input
                className="admin-input"
                value={site.hero.primaryButton}
                onChange={handleSite('hero', 'primaryButton')}
                placeholder="e.g. Explore Tours"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Primary Button Link</label>
              <input
                className="admin-input"
                value={site.hero.primaryButtonLink}
                onChange={handleSite('hero', 'primaryButtonLink')}
                placeholder="e.g. /tours"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Secondary Button Text</label>
              <input
                className="admin-input"
                value={site.hero.secondaryButton}
                onChange={handleSite('hero', 'secondaryButton')}
                placeholder="e.g. Learn More"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Secondary Button Link</label>
              <input
                className="admin-input"
                value={site.hero.secondaryButtonLink}
                onChange={handleSite('hero', 'secondaryButtonLink')}
                placeholder="e.g. /about"
              />
            </div>
          </div>
        </div>

        <div className="admin-settings__card">
          <div className="admin-settings__card-head">
            <h3>Homepage Stats</h3>
            <Button variant="secondary" size="sm" type="button" onClick={addStat}>
              + Add Stat
            </Button>
          </div>
          <div className="admin-settings__list">
            {site.stats.length === 0 && (
              <p className="admin-settings__empty">
                No stats yet. Click “+ Add Stat” to create one.
              </p>
            )}
            {site.stats.map((s, i) => (
              <div className="admin-settings__list-item" key={i}>
                <div className="admin-settings__list-item-grid">
                  <div className="admin-settings__field">
                    <label className="admin-label">Number</label>
                    <input
                      className="admin-input"
                      value={s.number}
                      onChange={handleStat(i, 'number')}
                      placeholder="e.g. 500+"
                    />
                  </div>
                  <div className="admin-settings__field">
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={s.label}
                      onChange={handleStat(i, 'label')}
                      placeholder="e.g. Tours Completed"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-settings__remove-btn"
                  onClick={() => removeStat(i)}
                  title="Remove stat"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-settings__card">
          <h3>Footer</h3>
          <div className="admin-settings__grid">
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Footer Description</label>
              <textarea
                className="admin-input admin-settings__textarea"
                value={site.footer.description}
                onChange={handleSite('footer', 'description')}
                rows="3"
                placeholder="Short description shown in the footer"
              />
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Copyright Text</label>
              <input
                className="admin-input"
                value={site.footer.copyright}
                onChange={handleSite('footer', 'copyright')}
                placeholder="e.g. All rights reserved. Use {year} for the current year."
              />
            </div>
          </div>
        </div>

        <div className="admin-settings__card">
          <h3>Social Links</h3>
          <div className="admin-settings__grid">
            {socialKeys.map((key) => (
              <div className="admin-settings__field" key={key}>
                <label className="admin-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)} URL
                </label>
                <input
                  className="admin-input"
                  value={site.social?.[key] || ''}
                  onChange={handleSocial(key)}
                  placeholder={`e.g. https://${key}.com/yourpage`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-settings__card">
          <h3>Contact Information</h3>
          <p className="admin-settings__desc">
            These details also appear on the Contact page and in the footer.
          </p>
          <div className="admin-settings__grid">
            <div className="admin-settings__field">
              <label className="admin-label">Phone</label>
              <input
                className="admin-input"
                value={contact.info.phone}
                onChange={handleContact('phone')}
                placeholder="e.g. +1 (555) 123-4567"
              />
            </div>
            <div className="admin-settings__field">
              <label className="admin-label">Email</label>
              <input
                className="admin-input"
                type="email"
                value={contact.info.email}
                onChange={handleContact('email')}
                placeholder="e.g. hello@yourcompany.com"
              />
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Address</label>
              <textarea
                className="admin-input admin-settings__textarea"
                value={contact.info.address}
                onChange={handleContact('address')}
                rows="2"
                placeholder="Line 1&#10;Line 2"
              />
            </div>
            <div className="admin-settings__field admin-settings__field--full">
              <label className="admin-label">Opening Hours</label>
              <textarea
                className="admin-input admin-settings__textarea"
                value={contact.info.hours}
                onChange={handleContact('hours')}
                rows="2"
                placeholder="Line 1&#10;Line 2"
              />
            </div>
          </div>
        </div>

        <div className="admin-settings__actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Site Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
