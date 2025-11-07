import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  const loginUser = (data) => {
    setUsuario(data.usuario);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("token", data.token);
  };

  const logoutUser = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
