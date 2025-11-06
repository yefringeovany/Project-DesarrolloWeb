import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { usuario, logoutUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 text-white">
      <div className="bg-white/10 p-8 rounded-2xl shadow-lg text-center backdrop-blur-md w-96">
        <h1 className="text-3xl font-bold mb-4">Bienvenido, {usuario?.usuario?.nombre}</h1>
        <p className="text-lg mb-4">Rol: {usuario?.usuario?.rol}</p>
        <button
          onClick={logoutUser}
          className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
