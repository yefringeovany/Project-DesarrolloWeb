import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook personalizado para gestionar la conexión de Socket.IO
 * @param {string} url - URL del servidor (ej: 'http://localhost:5000')
 * @param {boolean} requireAuth - Si requiere autenticación con token
 * @returns {object} { socket, isConnected, error }
 */
const useSocket = (url = import.meta.env.VITE_API_URL, requireAuth = true) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Configuración de la conexión
    const socketOptions = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    };

    // Agregar token si se requiere autenticación
    if (requireAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        socketOptions.auth = { token };
      }
    }

    // Crear conexión
    socketRef.current = io(url, socketOptions);

    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('✅ Socket conectado:', socketRef.current.id);
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketRef.current.on('error', (err) => {
      console.error('❌ Error de socket:', err);
      setError(err);
    });

    // Cleanup al desmontar
    return () => {
      if (socketRef.current) {
        console.log('🔌 Desconectando socket...');
        socketRef.current.disconnect();
      }
    };
  }, [url, requireAuth]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
};

export default useSocket;