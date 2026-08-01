import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { isImageUrl } from '../siteDefaults';
import Button from './Button';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/tours', label: 'Tours' },
  { path: '/blog', label: 'Blog' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { site } = useSettings();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);
  const closeProfile = () => setProfileOpen(false);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        closeProfile();
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          {isImageUrl(site.logoIcon) ? (
            <img className="navbar__logo-img" src={site.logoIcon} alt={`${site.name} logo`} />
          ) : (
            <span className="navbar__logo-icon">{site.logoIcon}</span>
          )}
          <span className="navbar__logo-text">{site.name}</span>
        </Link>

        <button
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && user.role !== 'admin' && (
              <li>
                <Link
                  to="/bookings"
                  className={`navbar__link ${location.pathname === '/bookings' ? 'navbar__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  My Bookings
                </Link>
              </li>
            )}
            {user?.role === 'admin' && (
              <li>
                <Link
                  to="/admin"
                  className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <div className="navbar__actions">
            <button
              className="navbar__theme"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            {user ? (
              <div className="navbar__profile" ref={profileRef}>
                <button
                  className="navbar__profile-btn"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <span className="navbar__user">{user.name}</span>
                  <span className={`navbar__caret ${profileOpen ? 'navbar__caret--open' : ''}`}>▾</span>
                </button>
                {profileOpen && (
                  <div className="navbar__profile-menu" role="menu">
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin?tab=settings" className="navbar__profile-item" onClick={closeProfile}>
                          Site Settings
                        </Link>
                        <Link to="/admin?tab=password" className="navbar__profile-item" onClick={closeProfile}>
                          Change Password
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      className="navbar__profile-item"
                      onClick={() => { closeProfile(); closeMenu(); logout(); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="secondary" size="sm" href="/login">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" href="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
