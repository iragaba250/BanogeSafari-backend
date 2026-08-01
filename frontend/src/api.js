const isProd = !import.meta.env.DEV;
const root = String(
  import.meta.env.VITE_API_URL || (isProd ? '' : 'http://localhost:5000')
).replace(/\/+$/, '');

export const API = root;
export const API_URL = `${root}/api`;
