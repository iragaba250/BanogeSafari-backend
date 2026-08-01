import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Blog.css';

import { API } from '../api';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => setPost(data.post))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <section className="section blog-page">
        <div className="container">
          <div className="blog-page__empty">
            <h3>Post not found</h3>
            <p>The post you are looking for does not exist.</p>
            <Link to="/blog" className="blog-post__back-link">
              &larr; Back to Blog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section blog-page">
        <div className="container">
          <div className="blog-page__empty">
            <p>Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section blog-page blog-post">
      <div className="container">
        <Link to="/blog" className="blog-post__back-link">
          &larr; Back to Blog
        </Link>

        <article className="blog-post__article">
          <span className="blog-card__category">{post.category}</span>
          <h1 className="blog-post__title">{post.title}</h1>
          <div className="blog-post__meta">
            <span>{post.author || 'BANOGE Safari'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {post.image && (
            <div className="blog-post__image">
              <img src={post.image} alt={post.title} />
            </div>
          )}

          {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}

          <div className="blog-post__content">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
