import { useAuth } from '../lib/auth-context';
import { AppLayout } from './AppLayout';
import { Outlet } from 'react-router-dom';

/**
 * Conditionally wraps content in AppLayout (with sidebar) when user is logged in.
 * Falls back to bare Outlet for unauthenticated users.
 * Used for routes that should be accessible both with and without auth (e.g., /community).
 */
export function ConditionalLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return user ? <AppLayout /> : <Outlet />;
}
