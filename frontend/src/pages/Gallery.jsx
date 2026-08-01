import { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle';
import './Gallery.css';

import { API } from '../api';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((data) => setImages(data.settings?.galleryImages || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <section className="section gallery-page">
      <div className="container">
        <SectionTitle
          subtitle="Gallery"
          title="Moments From Our Adventures"
          description="A look at the people, places, and wildlife that make every BANOGE safari unforgettable."
        />

        {images.length === 0 ? (
          <div className="gallery-page__empty">
            <h3>No photos yet</h3>
            <p>Check back soon to see moments from our adventures.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((url, i) => (
              <button
                key={i}
                className="gallery-grid__item"
                onClick={() => setSelected(url)}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={url} alt={`Gallery photo ${i + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="gallery-lightbox" onClick={() => setSelected(null)}>
          <button
            className="gallery-lightbox__close"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            &times;
          </button>
          <img
            className="gallery-lightbox__img"
            src={selected}
            alt="Gallery photo"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
