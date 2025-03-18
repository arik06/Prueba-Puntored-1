import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Función para manejar las actualizaciones de estado
    const handlePaymentStatusUpdate = (event) => {
      const { referenceId, status, message } = event.detail;
      
      // Mostrar notificación toast con estilo según el estado
      switch (status) {
        case 'PAGADO':
          toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'CANCELADO':
          toast.warning(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        default:
          toast.info(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
      }

      // Actualizar lista de notificaciones
      setNotifications(prev => [{
        id: Date.now(),
        referenceId,
        status,
        message,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    };

    // Suscribirse al evento de actualización de estado
    window.addEventListener('paymentStatusUpdate', handlePaymentStatusUpdate);

    // Limpiar al desmontar
    return () => {
      window.removeEventListener('paymentStatusUpdate', handlePaymentStatusUpdate);
    };
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
    isConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 