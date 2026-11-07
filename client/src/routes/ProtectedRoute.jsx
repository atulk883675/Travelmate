import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait until authentication check finishes
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to continue
  return <Outlet />;
};

export default ProtectedRoute;
