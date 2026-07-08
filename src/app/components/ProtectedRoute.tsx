import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'student' | 'teacher'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0C100D] text-[#ECEFE6]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3D5634] border-t-[#8DBF54]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'teacher' ? '/app/teacher' : '/app'} replace />;
  }

  return <Outlet />;
};
