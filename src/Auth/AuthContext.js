import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from '../Utility/authUtils';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'learner' or 'instructor'
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('userId');
    console.log('Login parameters:', { token, role, id });

    if (token && role && id && isTokenValid(token)) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserId(id);
    } else {
      logout(); // Clear invalid token
    }
    setIsLoading(false); // Mark loading as complete
  }, []);

  // Login function
  const login = (token, role, id) => {
    if (!id || !role) {
      console.error('Invalid login parameters: role or id is missing.');
      return;
    }

    console.log('Login parameters:', { token, role, id });

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    navigate(`/${role}/${id}/dashboard`);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    navigate('/auth');
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;