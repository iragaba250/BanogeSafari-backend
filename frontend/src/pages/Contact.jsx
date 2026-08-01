import { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { contactDefaults } from './contactDefaults';
import './Contact.css';

import { API } from '../api';

const emptyForm = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.contact) setContact(data.settings.contact);
      })
      .catch(() => {});
  }, []);

  const hero = contact?.hero || contactDefaults.hero;
  const info = contact?.info || contactDefaults.info;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section
        className="contact-hero"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.4) 100%), url('${hero.image}')` }}
      >
        <div className="container contact-hero__content">
          <SectionTitle
            subtitle={hero.subtitle}
            title={hero.title}
            description={hero.description}
            light
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-info__item">
                <div className="contact-info__icon">&#128222;</div>
                <div>
                  <h4>Phone</h4>
                  <p>{info.phone}</p>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">&#9993;</div>
                <div>
                  <h4>Email</h4>
                  <p>{info.email}</p>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">&#127968;</div>
                <div>
                  <h4>Office</h4>
                  <p>{info.address}</p>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">&#128337;</div>
                <div>
                  <h4>Hours</h4>
                  <p>{info.hours}</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="contact-success">
                  <div className="contact-success__icon">&#10004;</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <Button variant="primary" onClick={() => { setSubmitted(false); setForm(emptyForm); }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form__row">
                    <div className="contact-form__group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" placeholder="John Doe" required value={form.name} onChange={handleChange} />
                    </div>
                    <div className="contact-form__group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" name="email" placeholder="john@example.com" required value={form.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="contact-form__group">
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" name="subject" placeholder="Tour Inquiry" required value={form.subject} onChange={handleChange} />
                  </div>
                  <div className="contact-form__group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows={6} placeholder="Tell us about your dream trip..." required value={form.message} onChange={handleChange} />
                  </div>
                  {error && <div className="contact-form__error">{error}</div>}
                  <Button variant="primary" size="lg" type="submit" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
