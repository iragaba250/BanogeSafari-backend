import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import Hero from '../components/Hero';
import TourCard from '../components/TourCard';
import TestimonialCard from '../components/TestimonialCard';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import './Home.css';

import { API } from '../api';

const fallbackTours = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    title: 'Himalayan Explorer',
    location: 'Nepal',
    duration: '12 Days',
    price: 2499,
    rating: 4.9,
    description: 'Trek through the breathtaking Annapurna range with expert guides.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    title: 'Tropical Paradise',
    location: 'Maldives',
    duration: '7 Days',
    price: 1899,
    rating: 4.8,
    description: 'Relax on pristine white beaches and explore crystal-clear waters.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80',
    title: 'European Grandeur',
    location: 'Italy, France & Spain',
    duration: '15 Days',
    price: 3299,
    rating: 4.7,
    description: 'Experience the best of European culture, cuisine, and architecture.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
    title: 'African Safari',
    location: 'Kenya',
    duration: '10 Days',
    price: 2799,
    rating: 4.9,
    description: 'Witness the Big Five and the Great Migration in their natural habitat.',
  },
];

const fallbackTestimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Adventure Seeker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    text: 'The Himalayan Explorer tour was absolutely life-changing. The guides were knowledgeable, the views were breathtaking, and everything was perfectly organized.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Frequent Traveler',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    text: 'I have traveled with BANOGE safari three times now, and each experience has been exceptional. They truly care about creating meaningful travel experiences.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Family Traveler',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    text: 'Our family trip to the Maldives was unforgettable. The kids loved every moment, and we felt completely taken care of. Highly recommend!',
    rating: 5,
  },
];

const stats = [
  { number: '500+', label: 'Tours Completed' },
  { number: '50+', label: 'Destinations' },
  { number: '99%', label: 'Happy Clients' },
  { number: '12+', label: 'Years Experience' },
];

export default function Home() {
  const { site } = useSettings();
  const [featuredTours, setFeaturedTours] = useState(fallbackTours);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const statsList = site.stats?.length ? site.stats : stats;

  useEffect(() => {
    fetch(`${API}/api/tours`)
      .then((r) => r.json())
      .then((data) => {
        const tours = data.tours || [];
        const featured = tours.filter((t) => t.featured);
        setFeaturedTours(featured.length ? featured : tours);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/api/testimonials`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.testimonials || [];
        if (list.length) setTestimonials(list);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <section className="section stats">
        <div className="container stats__grid">
          {statsList.map((stat) => (
            <div className="stats__item" key={stat.label}>
              <div className="stats__number">{stat.number}</div>
              <div className="stats__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt popular-section">
        <div className="container">
          <SectionTitle
            subtitle="Popular Tours"
            title="Our Most Loved Adventures"
            description="Handpicked experiences that our travelers rave about."
          />
          <div className="tours-grid">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <div className="home__cta">
            <Button variant="primary" size="lg" href="/tours">
              View All Tours
            </Button>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <SectionTitle
            subtitle="Testimonials"
            title="What Our Travelers Say"
            description="Real stories from real adventurers."
          />
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-section__content">
          <SectionTitle
            subtitle="Ready to Explore?"
            title="Your Next Adventure Awaits"
            description="book your dream tour today and embark on a journey you'll never forget."
            light
          />
          <Button variant="accent" size="lg" href="/Tours">
            Get Started
          </Button>
        </div>
      </section>
    </>
  );
}
