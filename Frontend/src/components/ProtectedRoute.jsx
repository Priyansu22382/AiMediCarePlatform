import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    // role mismatch
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
