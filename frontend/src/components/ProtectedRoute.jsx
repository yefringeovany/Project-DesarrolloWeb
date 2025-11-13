import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Cargando...</div>; // evita parpadeo

  return usuario ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
