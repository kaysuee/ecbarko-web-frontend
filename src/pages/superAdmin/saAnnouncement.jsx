import { useState, useEffect } from "react";
// import axios from "axios";
import '../../styles/Announcement.css';
import { get, post, put, deleteUser } from '../../services/ApiEndpoint';

export default function saAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    scheduleAffected: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' 
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await get('/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showNotification('Failed to fetch announcements', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'urgent': return 'bx-error-circle';
      case 'warning': return 'bx-time-five';
      case 'info': return 'bx-info-circle';
      default: return 'bx-bullhorn';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'urgent': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info': return '#3498db';
      default: return '#2ecc71';
    }
  };

  const quickAnnouncements = [
    {
      title: "Schedule Cancelled Due to Typhoon",
      message: "All ferry schedules are cancelled due to severe weather conditions. Safety is our priority. Refunds will be processed automatically.",
      type: "urgent"
    },
    {
      title: "Delayed Departure - Technical Issues",
      message: "Ferry departure is delayed by 2 hours due to technical maintenance. We apologize for the inconvenience.",
      type: "warning"
    },
    {
      title: "Service Temporarily Suspended",
      message: "Ferry services are temporarily suspended due to port maintenance. Normal operations will resume shortly.",
      type: "warning"
    }
  ];

  const useQuickAnnouncement = (quick) => {
    setFormData({
      ...formData,
      title: quick.title,
      message: quick.message,
      type: quick.type
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      scheduleAffected: '',
      sendImmediately: true
    });
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      scheduleAffected: announcement.scheduleAffected || ''
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const sendAnnouncement = async () => {
    try {
      const announcementData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        scheduleAffected: formData.scheduleAffected,
        status: 'sent', 
        author: "Admin User"
      };

      if (editingId) {
        await put(`/api/announcements/${editingId}`, announcementData);
        showNotification("Announcement updated successfully!");
      } else {
        await post('/api/announcements', announcementData);
        showNotification("Announcement created successfully!");
      }

      await fetchAnnouncements();
      setShowForm(false);
      resetForm();

    } catch (error) {
      console.error('Error saving announcement:', error);
      showNotification(`Failed to ${editingId ? 'update' : 'create'} announcement.`, 'error');
    }
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteId(null);
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(`/api/announcements/${deleteId}`);
      setAnnouncements(prev => prev.filter(ann => ann._id !== deleteId));
      showNotification('Announcement deleted successfully!');
      closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showNotification('Failed to delete announcement.', 'error');
      closeDeleteConfirm();
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <main>
      <div className="head-title">
        <div className="left">
          <h1>Announcements</h1>
          <ul className="breadcrumb">
            <li><a href="#">Announcements</a></li>
          </ul>
        </div>
        <button className="btn-download" onClick={openCreateForm}>
          <i className="bx bx-bullhorn"></i>
          <span className="ann-text">New Announcement</span>
        </button>
      </div>

      <div className="ann-table-data">
        <div className="ann-order">
          <div className="ann-head">
            <h3>Recent Announcements</h3>
          </div>

          <div className="announcement-list">
            {announcements.length === 0 ? (
              <div className="no-announcements">
                <p>No announcements found.</p>
              </div>
            ) : (
              announcements.map(announcement => (
                <div key={announcement._id} className="announcement-card">
                  <div className="announcement-header">
                    <div className="announcement-type" style={{ color: getTypeColor(announcement.type) }}>
                      <i className={`bx ${getTypeIcon(announcement.type)}`}></i>
                      <span className="type-label">{announcement.type.toUpperCase()}</span>
                    </div>
                    <div className="announcement-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => openEditForm(announcement)}
                        title="Edit announcement"
                      >
                        <i className="bx bx-edit"></i>
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => openDeleteConfirm(announcement._id)}
                        title="Delete announcement"
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                      <div className="announcement-status">
                        <span className={`status-badge ${announcement.status}`}>
                          {announcement.status === 'sent' ? 'Sent' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="announcement-title">{announcement.title}</h4>
                  <p className="announcement-message">{announcement.message}</p>

                  <div className="announcement-details">
                    {announcement.scheduleAffected && (
                      <div className="ann-detail-row">
                        <span className="ann-detail-label">Schedules Affected:</span>
                        <span className="ann-detail-value">{announcement.scheduleAffected}</span>
                      </div>
                    )}
                    <div className="ann-detail-row">
                      <span className="ann-detail-label">Created:</span>
                      <span className="ann-detail-value">
                        {new Date(announcement.dateCreated).toLocaleDateString()} at {new Date(announcement.dateCreated).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="ann-detail-row">
                      <span className="ann-detail-label">Author:</span>
                      <span className="ann-detail-value">{announcement.author}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-content announcement-form">
            <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
            
            {!editingId && (
              <div className="ann-form-section">
                <label>Quick Templates</label>
                <div className="ann-quick-templates">
                  {quickAnnouncements.map((quick, index) => (
                    <button 
                      key={index}
                      className="ann-template-btn"
                      onClick={() => useQuickAnnouncement(quick)}
                      type="button"
                    >
                      <i className={`bx ${getTypeIcon(quick.type)}`}></i>
                      {quick.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ann-form-section">
              <label>Announcement Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="ann-form-section">
              <label>Title</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="ann-form-section">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="ann-form-section">
              <label>Schedule Affected (Optional)</label>
              <input
                type="text"
                name="scheduleAffected"
                value={formData.scheduleAffected}
                onChange={handleInputChange}
                placeholder="Schedule Code (e.g., SCHED2500000, SCHED2500001)"
              />
            </div>

            <div className="popup-actions">
              <button onClick={cancelForm} className="cancel-btn">Cancel</button>
              <button onClick={sendAnnouncement} className="save-btn">
                {editingId ? 'Update Announcement' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content delete-confirmation">
            <div className="delete-icon">
              <i className="bx bx-trash"></i>
            </div>
            <h3>Delete Announcement</h3>
            <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
            <div className="form-buttons">
              <button onClick={confirmDelete} className="delete-confirm-btn">
                <i className="bx bx-check"></i>
                Yes, Delete
              </button>
              <button onClick={closeDeleteConfirm} className="cancel-btn">
                <i className="bx bx-x"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="ann-popup-overlay">
          <div className={`ann-notification-modal ${notification.type}`}>
            <div className="ann-notification-content">
              <div className="ann-notification-icon">
                <i className={`bx ${notification.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}`}></i>
              </div>
              <p className="ann-notification-message">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}