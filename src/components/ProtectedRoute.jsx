import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useSelector(state => state.Auth);
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute Debug:', {
    user,
    loading,
    token: !!token,
    userRole: user?.role,
    allowedRoles
  });

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Checking authentication...</div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!token || !user) {
    console.log('Redirecting to login: No token or user');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const hasAccess = allowedRoles.includes(userRole) || 
                     (userRole === 'ticket clerk' && allowedRoles.includes('clerk')) ||
                     (user.clerk && allowedRoles.includes('clerk'));
    
    if (!hasAccess) {
      console.log('Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;