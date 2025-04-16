import {jwtDecode} from 'jwt-decode';

export const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now(); // Check if token is expired
  } catch (error) {
    return false; // Invalid token
  }
};