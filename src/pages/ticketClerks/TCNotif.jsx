import React, { useState, useEffect } from 'react';
import '../../styles/AllNotifications.css';

const tcNotif = () => {
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch notifications (simulated)
  useEffect(() => {
    // In a real app, you would fetch from an API
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setNotifications([
            {
              id: 1,
              type: 'booking',
              message: 'New booking request from John Doe',
              details: 'Vehicle: SUV, Route: Lucena to Marinduque, Date: 2025-03-31',
              time: '5 minutes ago',
              timestamp: '2025-04-03 10:25 AM',
              read: false
            },
            {
              id: 2,
              type: 'system',
              message: 'System maintenance scheduled for tonight at 2 AM',
              details: 'All systems will be unavailable for approximately 30 minutes during the scheduled maintenance window.',
              time: '1 hour ago',
              timestamp: '2025-04-03 09:30 AM',
              read: false
            },
            {
              id: 3,
              type: 'alert',
              message: 'Terminal 2 is experiencing high traffic',
              details: 'Current wait time at Terminal 2 is approximately 25 minutes. Consider redirecting traffic to Terminal 1 if possible.',
              time: '2 hours ago',
              timestamp: '2025-04-03 08:15 AM',
              read: false
            },
            {
              id: 4,
              type: 'booking',
              message: 'Sofia Martinez cancelled booking #12345',
              details: 'Booking #12345 has been cancelled. Refund of ₱150.00 has been processed and will be credited back within 3-5 business days.',
              time: 'Yesterday',
              timestamp: '2025-04-02 02:45 PM',
              read: false
            },
            {
              id: 5,
              type: 'payment',
              message: 'Payment received from Card #3344',
              details: 'Payment of ₱250.00 received for booking #13579. Transaction ID: TXN-7890-1234.',
              time: 'Yesterday',
              timestamp: '2025-04-02 11:20 AM',
              read: true
            },
            {
              id: 6,
              type: 'system',
              message: 'Database backup completed successfully',
              details: 'Weekly database backup has been completed and stored securely. Size: 1.2GB.',
              time: '2 days ago',
              timestamp: '2025-04-01 01:00 AM',
              read: true
            },
            {
              id: 7,
              type: 'alert',
              message: 'Low balance warning for multiple users',
              details: '15 users have balance below the minimum threshold (₱50.00). Consider sending reminder notifications.',
              time: '3 days ago',
              timestamp: '2025-03-31 10:10 AM',
              read: true
            },
            {
              id: 8,
              type: 'booking',
              message: 'Weekly booking summary is available',
              details: 'Summary for week ending 2025-03-30: 342 bookings, ₱45,280 revenue, 15% increase from previous week.',
              time: '1 week ago',
              timestamp: '2025-03-30 08:00 AM',
              read: true
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  // Handle marking a notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };
  
  // Handle marking all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({...notification, read: true})));
  };
  
  // Handle removing a notification
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Handle clearing all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Apply read/unread filter
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.message.toLowerCase().includes(query) || 
        notification.details.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Get icon based on notification type
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
  
  // Get color based on notification type
  const getTypeColor = (type) => {
    switch (type) {
      case 'booking':
        return 'blue';
      case 'system':
        return 'grey';
      case 'alert':
        return 'red';
      case 'payment':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <div className="all-notifications">
      <main style={{ paddingTop: '10px', marginTop: '0' }}>
        <div className="head-title">
          <div className="left">
            <h1>Notifications</h1>
            <ul className="breadcrumb">
              <li>
                <a href="#">Notification</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="notification-controls">
          <div className="notification-search">
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className='bx bx-search'></i>
          </div>
          
          <div className="filter-controls">
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'unread' ? 'active' : ''} 
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button 
                className={filter === 'read' ? 'active' : ''} 
                onClick={() => setFilter('read')}
              >
                Read
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.read)}
              >
                Mark All Read
              </button>
              <button 
                className="clear-all-btn"
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
        
        <div className="allnotification-container">
          {loading ? (
            <div className="loading-spinner">
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="an-empty-notifications">
              <i className='bx bx-bell-off'></i>
              <h3>No notifications found</h3>
              <p>
                {filter !== 'all' ? 
                  `There are no ${filter === 'unread' ? 'unread' : 'read'} notifications at the moment.` : 
                  searchQuery ? 
                    'No notifications match your search.' : 
                    'You don\'t have any notifications at the moment.'}
              </p>
            </div>
          ) : (
            <div className="notification-list">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-header">
                    <div className="notification-icon-container">
                      <div className={`notification-icon ${getTypeColor(notification.type)}`}>
                        <i className={getNotificationIcon(notification.type)}></i>
                      </div>
                    </div>
                    
                    <div className="notification-content">
                      <h3 className="notification-message">{notification.message}</h3>
                      <p className="notification-details">{notification.details}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          <i className='bx bx-time-five'></i>
                          {notification.timestamp}
                        </span>
                        <span className={`notification-type ${getTypeColor(notification.type)}`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <span className={`notification-status ${notification.read ? 'read' : 'unread'}`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          className="action-btn read-btn"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <i className='bx bx-check'></i>
                        </button>
                      )}
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => removeNotification(notification.id)}
                        title="Delete notification"
                      >
                        <i className='bx bx-trash'></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default tcNotif;