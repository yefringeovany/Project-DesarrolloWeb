import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { usuario, logoutUser } = useAuth();

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center text-primary mb-3">Panel Principal</h2>
        <p className="text-center">
          Bienvenido, <strong>{usuario?.nombre}</strong>
        </p>
        <p className="text-center">
          Rol: <span className="fw-semibold">{usuario?.rol}</span>
        </p>
        <div className="text-center">
          <button className="btn btn-danger" onClick={logoutUser}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
