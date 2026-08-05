import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { isImageUrl } from '../siteDefaults';
import './Footer.css';

const footerLinks = [
  {
    title: 'Quick Links',
    items: [
      { label: 'Home', path: '/' },
      { label: 'Tours', path: '/tours' },
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Destinations',
    items: [
      { label: 'Mountain Treks', path: '/tours' },
      { label: 'Beach Getaways', path: '/tours' },
      { label: 'City Tours', path: '/tours' },
      { label: 'Wild Safaris', path: '/tours' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'FAQs', path: '/contact' },
      { label: 'Privacy Policy', path: '/contact' },
      { label: 'Terms of Service', path: '/contact' },
      { label: 'Cancellation Policy', path: '/contact' },
    ],
  },
];

const socialLabels = {
  instagram: 'ig',
  twitter: 'x',
  youtube: 'yt',
  facebook: 'fb',
};

export default function Footer() {
  const { site } = useSettings();
  const year = new Date().getFullYear();
  const copyright = (site.footer.copyright || '').replace(/\{year\}/g, String(year));
  const social = site.social || {};
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              {isImageUrl(site.logoIcon) ? (
                <img className="footer__logo-img" src={site.logoIcon} alt={`${site.name} logo`} />
              ) : (
                <span className="footer__logo-icon">{site.logoIcon}</span>
              )}{' '}
              {site.name}
            </Link>
            <p className="footer__desc">{site.footer.description || site.tagline}</p>
            <div className="footer__social">
              {Object.entries(social).map(([key, href]) =>
                href ? (
                  <a
                    key={key}
                    href={href}
                    aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                    className="footer__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {socialLabels[key] || key}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div className="footer__group" key={group.title}>
              <h4 className="footer__group-title">{group.title}</h4>
              <ul className="footer__group-links">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="footer__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p>&copy; {year} {copyright}</p>
        </div>
      </div>
    </footer>
  );
}
