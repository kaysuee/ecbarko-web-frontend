import React, { useState, useEffect, useRef } from 'react';
import '../syles/topbar.css';

export default function Topbar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      message: 'New booking request from John Doe',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'system',
      message: 'System maintenance scheduled for tonight at 2 AM',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'alert',
      message: 'Terminal 2 is experiencing high traffic',
      time: '2 hours ago',
      read: false
    },
    {
      id: 4,
      type: 'booking',
      message: 'Sofia Martinez cancelled booking #12345',
      time: 'Yesterday',
      read: false
    },
    {
      id: 5,
      type: 'payment',
      message: 'Payment received from Card #3344',
      time: 'Yesterday',
      read: true
    },
    {
      id: 6,
      type: 'system',
      message: 'Database backup completed successfully',
      time: '2 days ago',
      read: true
    },
    {
      id: 7,
      type: 'alert',
      message: 'Low balance warning for multiple users',
      time: '3 days ago',
      read: true
    },
    {
      id: 8,
      type: 'booking',
      message: 'Weekly booking summary is available',
      time: '1 week ago',
      read: true
    }
  ]);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const notificationRef = useRef(null);
  
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({...notification, read: true})));
  };
  
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'bx bx-calendar-check';
      case 'system':
        return 'bx bx-cog';
      case 'alert':
        return 'bx bx-error-circle';
      case 'payment':
        return 'bx bx-credit-card';
      default:
        return 'bx bx-bell';
    }
  };

  return (
    <nav className="topbar">
      <i className="bx bx-menu"></i>
      
      {/* <div className="notification-container" ref={notificationRef}>
        <a href="#" className="notification" onClick={(e) => {
          e.preventDefault();
          toggleNotifications();
        }}>
          <i className="bx bxs-bell"></i>
          {unreadCount > 0 && <span className="num">{unreadCount}</span>}
        </a>
        
        {notificationsOpen && (
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="top-notification-icon">
                      <i className={getNotificationIcon(notification.type)}></i>
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">{notification.time}</p>
                    </div>
                    <button 
                      className="notification-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div className="icon-empty-notifications">
                  <i className="bx bx-bell-off"></i>
                  <p>No notifications</p>
                </div>
              )}
            </div>
            
            <div className="notification-footer">
              <a href="/admin/adminNotif">View all notifications</a>
            </div>
          </div>
        )}
      </div> */}
    </nav>
  );
}