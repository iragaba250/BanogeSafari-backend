import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle';
import './Blog.css';

import { API } from '../api';

const categories = ['all', 'news', 'tips', 'stories', 'general'];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [active, setActive] = useState('all');

  useEffect(() => {
    fetch(`${API}/api/posts`)
      .then((r) => r.json())
      .then((data) => setPosts((data.posts || []).filter((p) => p.published)))
      .catch(() => {});
  }, []);

  const filtered = active === 'all' ? posts : posts.filter((p) => p.category === active);

  return (
    <section className="section blog-page">
      <div className="container">
        <SectionTitle
          subtitle="Our Blog"
          title="Travel Stories & Tips"
          description="Guides, news, and stories from our team and travelers around the world."
        />

        {posts.length === 0 ? (
          <div className="blog-page__empty">
            <h3>No posts yet</h3>
            <p>Check back soon for travel stories and tips.</p>
          </div>
        ) : (
          <>
            <div className="blog-page__filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`blog-page__filter ${
                    active === cat ? 'blog-page__filter--active' : ''
                  }`}
                  onClick={() => setActive(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="blog-grid">
              {filtered.map((post) => (
                <article className="blog-card" key={post._id}>
                  <Link to={`/blog/${post._id}`} className="blog-card__image">
                    {post.image ? (
                      <img src={post.image} alt={post.title} loading="lazy" />
                    ) : (
                      <span className="blog-card__placeholder">{post.title}</span>
                    )}
                  </Link>
                  <div className="blog-card__body">
                    <span className="blog-card__category">{post.category}</span>
                    <h3 className="blog-card__title">
                      <Link to={`/blog/${post._id}`}>{post.title}</Link>
                    </h3>
                    <p className="blog-card__excerpt">
                      {post.excerpt || post.content.slice(0, 120)}
                    </p>
                    <div className="blog-card__meta">
                      <span>{post.author || 'BANOGE Safari'}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
