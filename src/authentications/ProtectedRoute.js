import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { checkToken } from './auth';

const ProtectedRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const valid = await checkToken();

        setIsValid(valid);
      } catch (error) {
        console.error('Error validating token:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
