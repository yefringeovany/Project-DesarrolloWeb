import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    const savedToken = localStorage.getItem("token");

    if (data) setUsuario(JSON.parse(data));
    if (savedToken) setToken(savedToken);
  }, []);

  const loginUser = (data) => {
    setUsuario(data.usuario);
    setToken(data.token);

    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("token", data.token);
  };

  const logoutUser = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
