import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { aboutDefaults } from './aboutDefaults';
import './AdminAbout.css';

import { API } from '../api';

const emptyValue = { icon: '', title: '', text: '' };
const emptyTeam = { name: '', role: '', avatar: '', bio: '' };

export default function AdminAbout() {
  const { token } = useAuth();
  const heroFileRef = useRef(null);
  const storyFileRef = useRef(null);
  const teamFileRefs = useRef([]);
  const [about, setAbout] = useState(() => structuredClone(aboutDefaults));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingTeam, setUploadingTeam] = useState(null);
  const [message, setMessage] = useState(null);

  const notify = (text, isError = false) => setMessage({ text, isError });

  const loadAbout = () => {
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.about) {
          const stored = data.settings.about;
          setAbout({
            hero: { ...aboutDefaults.hero, ...(stored.hero || {}) },
            story: {
              title: stored.story?.title || '',
              paragraphs: stored.story?.paragraphs || [],
              image: stored.story?.image || '',
            },
            values: Array.isArray(stored.values) ? stored.values : [],
            team: Array.isArray(stored.team) ? stored.team : [],
          });
        }
      })
      .catch(() => {});
  };

  useEffect(loadAbout, [token]);

  const handleChange = (section, field) => (e) => {
    const value = e.target.value;
    setAbout((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleStoryParagraph = (index) => (e) => {
    const value = e.target.value;
    setAbout((prev) => {
      const paragraphs = [...prev.story.paragraphs];
      paragraphs[index] = value;
      return { ...prev, story: { ...prev.story, paragraphs } };
    });
  };

  const addStoryParagraph = () => {
    setAbout((prev) => ({
      ...prev,
      story: { ...prev.story, paragraphs: [...prev.story.paragraphs, ''] },
    }));
  };

  const removeStoryParagraph = (index) => {
    setAbout((prev) => ({
      ...prev,
      story: { ...prev.story, paragraphs: prev.story.paragraphs.filter((_, i) => i !== index) },
    }));
  };

  const handleListItem = (section, index, field) => (e) => {
    const value = e.target.value;
    setAbout((prev) => {
      const items = prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, [section]: items };
    });
  };

  const addListItem = (section, empty) => {
    setAbout((prev) => ({ ...prev, [section]: [...prev[section], { ...empty }] }));
  };

  const removeListItem = (section, index) => {
    setAbout((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const uploadImage = async (fileRef, section, field) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=about`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAbout((prev) => ({ ...prev, [section]: { ...prev[section], [field]: data.url } }));
      notify('Image uploaded');
      fileRef.current.value = '';
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  const uploadTeamAvatar = async (index) => {
    const file = teamFileRefs.current[index]?.files?.[0];
    if (!file) return;
    setUploadingTeam(index);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/tour?prefix=about`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAbout((prev) => ({
        ...prev,
        team: prev.team.map((m, i) => (i === index ? { ...m, avatar: data.url } : m)),
      }));
      notify('Avatar uploaded');
      teamFileRefs.current[index].value = '';
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUploadingTeam(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      key: 'about',
      value: {
        hero: {
          subtitle: about.hero.subtitle.trim(),
          title: about.hero.title.trim(),
          description: about.hero.description.trim(),
          image: about.hero.image.trim(),
        },
        story: {
          title: about.story.title.trim(),
          paragraphs: about.story.paragraphs.map((p) => p.trim()).filter(Boolean),
          image: about.story.image.trim(),
        },
        values: about.values
          .map((v) => ({ icon: v.icon.trim(), title: v.title.trim(), text: v.text.trim() }))
          .filter((v) => v.title),
        team: about.team
          .map((m) => ({
            name: m.name.trim(),
            role: m.role.trim(),
            avatar: m.avatar.trim(),
            bio: m.bio.trim(),
          }))
          .filter((m) => m.name),
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
      notify('About page saved successfully');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-about">
      <div className="admin-about__header">
        <div>
          <h2>Manage About Page</h2>
          <p className="admin-about__desc">
            Edit the hero banner, our story, values, and team shown on the About page.
          </p>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'admin-message--error' : ''}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-about__card">
          <h3>Hero Banner</h3>
          <div className="admin-about__grid">
            <div className="admin-about__field">
              <label className="admin-label">Subtitle</label>
              <input
                className="admin-input"
                value={about.hero.subtitle}
                onChange={handleChange('hero', 'subtitle')}
                placeholder="e.g. About Us"
              />
            </div>
            <div className="admin-about__field">
              <label className="admin-label">Title</label>
              <input
                className="admin-input"
                value={about.hero.title}
                onChange={handleChange('hero', 'title')}
                placeholder="e.g. We Live for Adventure"
              />
            </div>
            <div className="admin-about__field admin-about__field--full">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-input admin-about__textarea"
                value={about.hero.description}
                onChange={handleChange('hero', 'description')}
                rows="3"
                placeholder="A short intro shown under the hero title."
              />
            </div>
            <div className="admin-about__field admin-about__field--full">
              <label className="admin-label">Hero Background Image</label>
              <div className="admin-about__image-row">
                <input
                  className="admin-input"
                  value={about.hero.image}
                  onChange={handleChange('hero', 'image')}
                  placeholder="Paste image URL"
                />
                <input
                  ref={heroFileRef}
                  type="file"
                  className="admin-about__file"
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                />
                <Button variant="secondary" onClick={() => uploadImage(heroFileRef, 'hero', 'image')} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {about.hero.image && (
                <div className="admin-about__preview">
                  <img src={about.hero.image} alt="Hero preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-about__card">
          <h3>Our Story</h3>
          <div className="admin-about__grid">
            <div className="admin-about__field admin-about__field--full">
              <label className="admin-label">Heading</label>
              <input
                className="admin-input"
                value={about.story.title}
                onChange={handleChange('story', 'title')}
                placeholder="e.g. Our Story"
              />
            </div>
            <div className="admin-about__field admin-about__field--full">
              <label className="admin-label">Paragraphs</label>
              {about.story.paragraphs.map((p, i) => (
                <div className="admin-about__paragraph" key={i}>
                  <textarea
                    className="admin-input admin-about__textarea"
                    value={p}
                    onChange={handleStoryParagraph(i)}
                    rows="3"
                    placeholder={`Paragraph ${i + 1}`}
                  />
                  {about.story.paragraphs.length > 1 && (
                    <button
                      type="button"
                      className="admin-about__remove-btn"
                      onClick={() => removeStoryParagraph(i)}
                      title="Remove paragraph"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addStoryParagraph} type="button">
                + Add Paragraph
              </Button>
            </div>
            <div className="admin-about__field admin-about__field--full">
              <label className="admin-label">Story Image</label>
              <div className="admin-about__image-row">
                <input
                  className="admin-input"
                  value={about.story.image}
                  onChange={handleChange('story', 'image')}
                  placeholder="Paste image URL"
                />
                <input
                  ref={storyFileRef}
                  type="file"
                  className="admin-about__file"
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                />
                <Button variant="secondary" onClick={() => uploadImage(storyFileRef, 'story', 'image')} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {about.story.image && (
                <div className="admin-about__preview">
                  <img src={about.story.image} alt="Story preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-about__card">
          <div className="admin-about__card-head">
            <h3>Our Values</h3>
            <Button variant="secondary" size="sm" type="button" onClick={() => addListItem('values', emptyValue)}>
              + Add Value
            </Button>
          </div>
          <div className="admin-about__list">
            {about.values.length === 0 && (
              <p className="admin-about__empty">No values yet. Click “+ Add Value” to create one.</p>
            )}
            {about.values.map((v, i) => (
              <div className="admin-about__list-item" key={i}>
                <div className="admin-about__list-item-grid">
                  <div className="admin-about__field">
                    <label className="admin-label">Icon (emoji)</label>
                    <input
                      className="admin-input"
                      value={v.icon}
                      onChange={handleListItem('values', i, 'icon')}
                      placeholder="e.g. 🌍"
                    />
                  </div>
                  <div className="admin-about__field">
                    <label className="admin-label">Title</label>
                    <input
                      className="admin-input"
                      value={v.title}
                      onChange={handleListItem('values', i, 'title')}
                      placeholder="e.g. Sustainable Travel"
                    />
                  </div>
                  <div className="admin-about__field admin-about__field--full">
                    <label className="admin-label">Text</label>
                    <input
                      className="admin-input"
                      value={v.text}
                      onChange={handleListItem('values', i, 'text')}
                      placeholder="Short description"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-about__remove-btn admin-about__remove-btn--item"
                  onClick={() => removeListItem('values', i)}
                  title="Remove value"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-about__card">
          <div className="admin-about__card-head">
            <h3>Team Members</h3>
            <Button variant="secondary" size="sm" type="button" onClick={() => addListItem('team', emptyTeam)}>
              + Add Member
            </Button>
          </div>
          <div className="admin-about__list">
            {about.team.length === 0 && (
              <p className="admin-about__empty">No team members yet. Click “+ Add Member” to create one.</p>
            )}
            {about.team.map((m, i) => (
              <div className="admin-about__list-item" key={i}>
                <div className="admin-about__list-item-grid">
                  <div className="admin-about__field">
                    <label className="admin-label">Name</label>
                    <input
                      className="admin-input"
                      value={m.name}
                      onChange={handleListItem('team', i, 'name')}
                      placeholder="e.g. James Wilson"
                    />
                  </div>
                  <div className="admin-about__field">
                    <label className="admin-label">Role</label>
                    <input
                      className="admin-input"
                      value={m.role}
                      onChange={handleListItem('team', i, 'role')}
                      placeholder="e.g. Founder & CEO"
                    />
                  </div>
                  <div className="admin-about__field admin-about__field--full">
                    <label className="admin-label">Avatar</label>
                    <div className="admin-about__avatar-row">
                      <input
                        className="admin-input"
                        value={m.avatar}
                        onChange={handleListItem('team', i, 'avatar')}
                        placeholder="Paste remote image URL"
                      />
                      <input
                        ref={(el) => (teamFileRefs.current[i] = el)}
                        type="file"
                        className="admin-about__file"
                        accept=".jpg,.jpeg,.png,.webp,.avif"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => uploadTeamAvatar(i)}
                        disabled={uploadingTeam !== null}
                      >
                        {uploadingTeam === i ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                    {m.avatar && (
                      <div className="admin-about__avatar-preview">
                        <img src={m.avatar} alt={`${m.name} preview`} />
                        <span>Image preview</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-about__field admin-about__field--full">
                    <label className="admin-label">Bio</label>
                    <textarea
                      className="admin-input admin-about__textarea"
                      value={m.bio}
                      onChange={handleListItem('team', i, 'bio')}
                      rows="2"
                      placeholder="Short bio"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-about__remove-btn admin-about__remove-btn--item"
                  onClick={() => removeListItem('team', i)}
                  title="Remove member"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-about__actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save About Page'}
          </Button>
        </div>
      </form>
    </div>
  );
}
