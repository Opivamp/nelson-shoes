import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { RouteLoader } from './RouteLoader';

interface RouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard that requires the customer to be authenticated.
 * If unauthenticated, redirects to /account/login with origin preserved in state.
 */
export const CustomerProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useCustomerAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for customer login/signup pages.
 * If already authenticated, redirects away to /account.
 */
export const CustomerGuestRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useCustomerAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/account';
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
