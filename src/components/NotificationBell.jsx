import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { Dropdown, Badge } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearNotifications, isConnected } = useNotifications();
  const [show, setShow] = useState(false);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
    // Aquí puedes agregar navegación a la referencia específica si lo deseas
  };

  return (
    <Dropdown 
      show={show} 
      onToggle={(isOpen) => setShow(isOpen)}
      align="end"
      className="notification-bell"
    >
      <Dropdown.Toggle variant="link" className="notification-toggle">
        <div className="bell-container">
          <FaBell className={`bell-icon ${isConnected ? 'connected' : 'disconnected'}`} />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              className="notification-badge"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="notification-header">
          <h6 className="mb-0">Notificaciones</h6>
          <div className="notification-actions">
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
            {notifications.length > 0 && (
              <button 
                className="clear-button"
                onClick={clearNotifications}
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              No hay notificaciones
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-time">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                      locale: es
                    })}
                  </small>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell; 