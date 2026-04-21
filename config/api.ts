export const BASE_URL = "http://192.168.29.43:5000/api";

export const API = {
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  FOODS: `${BASE_URL}/foods`,
  CART: `${BASE_URL}/cart`,
  ORDER: `${BASE_URL}/orders`,
};

export default BASE_URL;