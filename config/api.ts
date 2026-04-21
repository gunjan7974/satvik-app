export const BASE_URL = "http://192.168.29.43:5000";

export const API_BASE = `${BASE_URL}/api`;

export const API = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  USERS: `${API_BASE}/users`,
  FOODS: `${API_BASE}/foods`,
  CATEGORIES: `${API_BASE}/categories`,
  CART: `${API_BASE}/cart`,
  ORDER: `${API_BASE}/orders`,
  EVENTS: `${API_BASE}/events`,
  BLOGS: `${API_BASE}/blogs`,
  GALLERY: `${API_BASE}/gallery`,
  CONTACT: `${API_BASE}/contacts`,
  ADMIN: `${API_BASE}/admin`,
};

export default BASE_URL;