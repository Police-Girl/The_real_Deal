import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const { accounts, instance } = useMsal();
  const location = useLocation();

  // Process any pending redirect response once.
  // useEffect(() => {
  //   instance.handleRedirectPromise().catch((error) => {
  //     console.error('AuthGuard redirect error:', error);
  //   });
  // }, [instance]);

  
  if (accounts.length === 0) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;