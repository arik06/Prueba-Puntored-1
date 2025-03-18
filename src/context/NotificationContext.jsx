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
    const handlePaymentStatusUpdate = (event) => {
      const { referenceId, status, message } = event.detail;
      
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

      setNotifications(prev => [{
        id: Date.now(),
        referenceId,
        status,
        message,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    };

    window.addEventListener('paymentStatusUpdate', handlePaymentStatusUpdate);

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