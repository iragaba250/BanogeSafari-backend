export const siteDefaults = {
  name: 'BANOGE safari',
  logoIcon: '/logo.png',
  tagline:
    'Explore the world with curated travel experiences. We craft unforgettable journeys that create lifelong memories.',
  currency: 'USD',
  hero: {
    badge: 'Adventure Awaits',
    title: "Discover the World's",
    highlight: 'Most Beautiful',
    titleEnd: 'Places',
    subtitle:
      'Curated tours, expert guides, and unforgettable experiences. Your dream journey starts here.',
    primaryButton: 'Explore Tours',
    primaryButtonLink: '/tours',
    secondaryButton: 'Learn More',
    secondaryButtonLink: '/about',
  },
  stats: [
    { number: '500+', label: 'Tours Completed' },
    { number: '50+', label: 'Destinations' },
    { number: '99%', label: 'Happy Clients' },
    { number: '12+', label: 'Years Experience' },
  ],
  footer: {
    description:
      'Explore the world with curated travel experiences. We craft unforgettable journeys that create lifelong memories.',
    copyright: 'All rights reserved.',
  },
  social: {
    instagram: 'https://www.instagram.com/gisubizo29/',
    twitter: '#',
    youtube: '#',
    facebook: '#',
  },
};

export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RWF: 'FRw',
  KES: 'KSh',
  UGX: 'USh',
  TZS: 'TSh',
  ZAR: 'R',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
};

export const formatPrice = (amount, currency = 'USD') => {
  const symbol = currencySymbols[currency] || currency;
  const value = Number(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
  return `${symbol}${value}`;
};

export const deepMerge = (base, override = {}) => {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override)) {
    const value = override[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === 'object' &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
};

export const isImageUrl = (value = '') =>
  /^(https?:\/\/|\/uploads\/|\/)(.*\.(png|jpe?g|webp|avif))($|\?)/i.test(String(value).trim());
