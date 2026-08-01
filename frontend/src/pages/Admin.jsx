import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import AdminTours from './AdminTours';
import AdminBookings from './AdminBookings';
import AdminUsers from './AdminUsers';
import AdminGallery from './AdminGallery';
import AdminPosts from './AdminPosts';
import AdminTestimonials from './AdminTestimonials';
import AdminAbout from './AdminAbout';
import AdminContact from './AdminContact';
import AdminStats from './AdminStats';
import AdminSettings from './AdminSettings';
import ChangePassword from './ChangePassword';
import './Admin.css';

import { API } from '../api';

export default function Admin() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileRef = useRef(null);
  const activeTab = searchParams.get('tab') || 'tours';
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [newMessages, setNewMessages] = useState(0);

  const fetchImages = () => {
    if (!token) return;
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.heroImages) setImages(data.settings.heroImages);
      })
      .catch(() => {});
  };

  useEffect(fetchImages, [token]);

  const markBookingsSeen = () => {
    localStorage.setItem('bookingsSeenAt', new Date().toISOString());
    setPendingCount(0);
  };

  const fetchPendingCount = useCallback(() => {
    if (!token) return;
    const seenAt = localStorage.getItem('bookingsSeenAt') || '';
    fetch(`${API}/api/bookings/pending-count?since=${encodeURIComponent(seenAt)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (activeTab !== 'bookings') setPendingCount(data.count || 0);
      })
      .catch(() => {});
  }, [token, activeTab]);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  const markCustomersSeen = () => {
    localStorage.setItem('customersSeenAt', new Date().toISOString());
    setNewCustomers(0);
  };

  const fetchNewCustomers = useCallback(() => {
    if (!token) return;
    const seenAt = localStorage.getItem('customersSeenAt') || '';
    fetch(`${API}/api/auth/users/count?since=${encodeURIComponent(seenAt)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (activeTab !== 'customers') setNewCustomers(data.count || 0);
      })
      .catch(() => {});
  }, [token, activeTab]);

  useEffect(() => {
    fetchNewCustomers();
    const interval = setInterval(fetchNewCustomers, 30000);
    return () => clearInterval(interval);
  }, [fetchNewCustomers]);

  const fetchNewMessages = useCallback(() => {
    if (!token) return;
    fetch(`${API}/api/contact/new-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (activeTab !== 'contact') setNewMessages(data.count || 0);
      })
      .catch(() => {});
  }, [token, activeTab]);

  useEffect(() => {
    fetchNewMessages();
    const interval = setInterval(fetchNewMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchNewMessages]);

  const uploadFile = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setMessage('');
    setUploading(true);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`${API}/api/upload/hero`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImages(data.images);
      setMessage('Image uploaded!');
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
      const res = await fetch(`${API}/api/upload/hero/${index}`, {
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

  if (!user || user.role !== 'admin') {
    return (
      <section className="admin-section">
        <div className="container">
          <div className="admin-unauthorized">
            <h2>Access Denied</h2>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="container">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'tours' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'tours' })}
          >
            Manage Tours
          </button>
          <button
            className={`admin-tab admin-tab--notif ${activeTab === 'bookings' ? 'admin-tab--active' : ''}`}
            onClick={() => { markBookingsSeen(); setSearchParams({ tab: 'bookings' }); }}
          >
            Manage Bookings
            {pendingCount > 0 && <span className="admin-tab__notif">{pendingCount}</span>}
          </button>
          <button
            className={`admin-tab admin-tab--notif ${activeTab === 'customers' ? 'admin-tab--active' : ''}`}
            onClick={() => { markCustomersSeen(); setSearchParams({ tab: 'customers' }); }}
          >
            Manage Customers
            {newCustomers > 0 && <span className="admin-tab__notif">{newCustomers}</span>}
          </button>
          <button
            className={`admin-tab ${activeTab === 'gallery' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'gallery' })}
          >
            Manage Gallery
          </button>
          <button
            className={`admin-tab ${activeTab === 'posts' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'posts' })}
          >
            Manage Blog
          </button>
          <button
            className={`admin-tab ${activeTab === 'testimonials' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'testimonials' })}
          >
            Manage Testimonials
          </button>
          <button
            className={`admin-tab ${activeTab === 'about' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'about' })}
          >
            Manage About
          </button>
          <button
            className={`admin-tab admin-tab--notif ${activeTab === 'contact' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'contact' })}
          >
            Manage Contact
            {newMessages > 0 && <span className="admin-tab__notif">{newMessages}</span>}
          </button>
          <button
            className={`admin-tab ${activeTab === 'hero' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'hero' })}
          >
            Hero Images
          </button>
          <button
            className={`admin-tab ${activeTab === 'reports' ? 'admin-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: 'reports' })}
          >
            Reports
          </button>
        </div>

        {activeTab === 'tours' ? (
          <AdminTours />
        ) : activeTab === 'reports' ? (
          <AdminStats />
        ) : activeTab === 'bookings' ? (
          <AdminBookings />
        ) : activeTab === 'customers' ? (
          <AdminUsers />
        ) : activeTab === 'gallery' ? (
          <AdminGallery />
        ) : activeTab === 'posts' ? (
          <AdminPosts />
        ) : activeTab === 'testimonials' ? (
          <AdminTestimonials />
        ) : activeTab === 'about' ? (
          <AdminAbout />
        ) : activeTab === 'contact' ? (
          <AdminContact />
        ) : activeTab === 'settings' ? (
          <AdminSettings />
        ) : activeTab === 'password' ? (
          <ChangePassword />
        ) : (
        <div className="admin-card">
          <h2>Hero Slideshow Images</h2>
          <p className="admin-card__desc">
            Upload images from your computer. They will rotate as a slideshow on the homepage every 6 seconds.
          </p>

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
            <div className="admin-image-list">
              <label className="admin-label">Current Images ({images.length})</label>
              {images.map((url, i) => (
                <div key={i} className="admin-image-item">
                  <img src={url} alt={`Slide ${i + 1}`} />
                  <span className="admin-image-index">Slide {i + 1}</span>
                  <button className="admin-image-remove" onClick={() => removeImage(i)}>
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
        )}
      </div>
    </section>
  );
}
