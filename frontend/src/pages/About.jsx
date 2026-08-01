import { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { aboutDefaults } from './aboutDefaults';
import './About.css';

import { API } from '../api';

export default function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.about) setAbout(data.settings.about);
      })
      .catch(() => {});
  }, []);

  const hero = about?.hero || aboutDefaults.hero;
  const story = about?.story || aboutDefaults.story;
  const values = about?.values || aboutDefaults.values;
  const team = about?.team || aboutDefaults.team;

  return (
    <>
      <section
        className="about-hero"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.4) 100%), url('${hero.image}')` }}
      >
        <div className="container about-hero__content">
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
          <div className="about-story">
            <div className="about-story__content">
              <h2>{story.title}</h2>
              {story.paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="about-story__image">
              <img
                src={story.image}
                alt={story.title}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            subtitle="Our Values"
            title="What Drives Us"
            description="These core principles guide everything we do."
          />
          <div className="about-values">
            {values.map((value) => (
              <div className="about-values__item" key={value.title}>
                <div className="about-values__icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            subtitle="Our Team"
            title="Meet the People Behind the Adventures"
            description="Passionate travelers dedicated to creating your perfect journey."
          />
          <div className="about-team">
            {team.map((member) => (
              <div className="about-team__card" key={member.name}>
                <img src={member.avatar} alt={member.name} className="about-team__avatar" loading="lazy" />
                <h3 className="about-team__name">{member.name}</h3>
                <div className="about-team__role">{member.role}</div>
                <p className="about-team__bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
