import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import Button from './Button';
import './Hero.css';

import { API_URL as API } from '../api';
const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80';

export default function Hero() {
  const { site } = useSettings();
  const hero = site.hero;
  const [images, setImages] = useState([FALLBACK]);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.heroImages?.length) setImages(data.settings.heroImages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((prev) => (prev + 1) % images.length);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPrev(null), 1500);
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutRef.current);
    };
  }, [images.length, current]);

  const goTo = (i) => {
    if (i === current) return;
    setPrev(current);
    setCurrent(i);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPrev(null), 1500);
  };

  return (
    <section className="hero">
      <div
        className="hero__bg hero__bg--current"
        style={{ backgroundImage: `url(${images[current]})` }}
      />
      {prev !== null && (
        <div
          className="hero__bg hero__bg--exit"
          style={{ backgroundImage: `url(${images[prev]})` }}
        />
      )}
      <div className="hero__overlay" />
      <div className="container hero__content">
        <span className="hero__badge">{hero.badge}</span>
        <h1 className="hero__title">
          {hero.title}{' '}
          <span className="hero__highlight">{hero.highlight}</span> {hero.titleEnd}
        </h1>
        <p className="hero__subtitle">{hero.subtitle}</p>
        <div className="hero__actions">
          <Button variant="accent" size="lg" href={hero.primaryButtonLink || '/tours'}>
            {hero.primaryButton || 'Explore Tours'}
          </Button>
          <Button variant="outline-light" size="lg" href={hero.secondaryButtonLink || '/about'}>
            {hero.secondaryButton || 'Learn More'}
          </Button>
        </div>

        {images.length > 1 && (
          <div className="hero__dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
