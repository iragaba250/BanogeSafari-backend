import { useState, useEffect } from 'react';
import TourCard from '../components/TourCard';
import SectionTitle from '../components/SectionTitle';
import './Tours.css';

import { API } from '../api';

const categories = ['all', 'trekking', 'beach', 'cultural', 'safari'];

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [active, setActive] = useState('all');

  useEffect(() => {
    fetch(`${API}/api/tours`)
      .then((r) => r.json())
      .then((data) => setTours(data.tours || []))
      .catch(() => {});
  }, []);

  const filtered = active === 'all' ? tours : tours.filter((t) => t.category === active);

  return (
    <section className="section tours-page">
      <div className="container">
        <SectionTitle
          subtitle="Our Tours"
          title="Choose Your Adventure"
          description="From mountain treks to beach getaways, we have the perfect trip for you."
        />

        <div className="tours-page__filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tours-page__filter ${active === cat ? 'tours-page__filter--active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="tours-page__empty">
            <h3>No tours found</h3>
            <p>No tours are available in this category yet.</p>
          </div>
        ) : (
          <div className="tours-grid">
            {filtered.map((tour) => (
              <TourCard key={tour._id || tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
