import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
