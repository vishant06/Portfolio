const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const request = async (path, options = {}) => {
  const token = localStorage.getItem('portfolio_token');
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const absoluteAsset = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
};

export default request;
