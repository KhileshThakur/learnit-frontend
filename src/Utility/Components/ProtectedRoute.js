import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../Auth/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, userRole, userId } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading spinner while checking authentication
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;
