import '../../styles/Users.css';
import profile from '../../assets/imgs/profile.png';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { generateTablePDF } from '../../utils/pdfUtils'; 
import { useSelector } from 'react-redux';

export default function Users() {
  const user = useSelector((state) => state.Auth.user);
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActivateDeactivatePopup, setShowActivateDeactivatePopup] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState(null);

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);
  const reasons = ['User requested', 'Inactive for too long', 'Security breach', 'Other'];
  const [adminAuth, setAdminAuth] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/users', { withCredentials: true })
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Fetch error:', err);
        toast.error('Failed to fetch users');
      });
  }, []);

  const confirmAdd = async () => {
    try {
      const maxId = users.reduce((max, u) => {
        const idNum = Number(u.userId);
        return !isNaN(idNum) && idNum > max ? idNum : max;
      }, 0);
      const newUserId = (maxId + 1).toString();
      const payload = { ...formData, userId: newUserId, status: 'active', lastActive: new Date().toISOString() };

      const res = await axios.post(
        'http://localhost:4000/api/users',
        payload,
        { withCredentials: true }
      );
      setUsers((prev) => [...prev, res.data]);
      toast.success('User added successfully');
    } catch (err) {
      console.error('Add error:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to add user');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  const confirmEdit = async () => {
    try {
      const res = await axios.put(
        `http://localhost:4000/api/users/${editUserId}`,
        formData,
        { withCredentials: true }
      );
      setUsers((prev) => prev.map((u) => (u._id === editUserId ? res.data : u)));
      toast.success('User updated successfully');
    } catch (err) {
      console.error('Edit error:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const handleAddOrUpdate = () => {
    if (isEditing) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const toggleStatus = (user) => {
    setSelectedAccount(user);
    setSelectedReason('');
    setShowActivateDeactivatePopup(true);
  };

  const handleStatusChange = async () => {
    try {
      if((user.email !== adminAuth.email || user.password !== adminAuth.password) && selectedAccount.status === 'active') {
        toast.error('Admin authentication failed');
        setSelectedReason("");
        setAdminAuth({ email: '', password: '' });
        return;
      }
      const newStatus = selectedAccount.status === 'deactivated' ? 'active' : 'deactivated';
      const res = await axios.put(
        `http://localhost:4000/api/users/${selectedAccount._id}/status`,
        { status: newStatus, reason: selectedReason },
        { withCredentials: true }
      );
      setUsers((prev) => prev.map((u) => (u._id === selectedAccount._id ? res.data : u)));
      setSelectedReason("");
      setAdminAuth({ email: '', password: '' });
      toast.success(
        `${newStatus === 'active' ? 'Reactivated' : 'Deactivated'} user successfully`
      );
      setShowActivateDeactivatePopup(false);
      setSelectedAccount(null);
    } catch (err) {
      console.error('Status change error:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to change status');
    }
  };

  const handleAdminAuthChange = (e) =>
    setAdminAuth({ ...adminAuth, [e.target.name]: e.target.value });

  const startEdit = (user) => {
    setEditUserId(user._id);
    setFormData({ name: user.name, email: user.email, phone: user.phone });
    setShowForm(true);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditUserId(null);
    setShowForm(false);
    setIsEditing(false);
  };

  const handleDownloadPDF = () => {
    generateTablePDF('.card-table table', 'users-report', 'Users Report');
  };

  const handleSortClick = () => setSortMode((prev) => (prev === null ? 0 : prev === 0 ? 1 : prev === 1 ? 2 : null));
  const resetSorting = () => setSortMode(null);

  const displayedUsers = useMemo(() => {
    let list = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }
    if (sortMode !== null) {
      list.sort((a, b) => {
        const rank = (user) => {
          if (sortMode === 0) return user.status === 'active' ? 0 : 1;
          if (sortMode === 1) return user.status === 'deactivated' ? 0 : 1;
          if (sortMode === 2) return user.status === 'inactive' ? 0 : 1;
        };
        return rank(a) - rank(b);
      });
    }
    return list;
  }, [users, searchTerm, sortMode]);

  return (
    <div className="content">
      <Toaster position="top-center" />
      <main>
        <div className="head-title">
          <div className="left">
            <h1>Accounts</h1>
            <ul className="breadcrumb"><li><a href="#">Accounts</a></li></ul>
          </div>
          <a href="#" className="btn-download" onClick={handleDownloadPDF}>
            <i className="bx bxs-cloud-download"></i>
            <span className="text">Download PDF</span>
          </a>
        </div>
        <div className="card-table">
          <div className="order">
            <div className="head">
              <h3>Accounts</h3>
              <div className="search-container">
              <input
                type="text"
                placeholder="Search accounts..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bx bx-search"></i>
              </div>
              <i className="bx bx-sort" onClick={handleSortClick} title="Sort by Status"></i>
              <i className="bx bx-reset" onClick={resetSorting} title="Reset to Default"></i>
              <i className="bx bx-plus" onClick={() => setShowForm(true)}></i>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user._id}>
                    <td><img src={profile} alt={user.name} />{user.name}</td>
                    <td>{user.userId}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>*************</td>
                    <td>
                      <span
                        className={`status ${user.status}`}
                        onClick={() => toggleStatus(user)}
                        style={{ cursor: 'pointer' }}
                        title={`Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td><i className="bx bx-pencil" onClick={() => startEdit(user)} style={{ cursor: 'pointer' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div className="popup-actions">
              <button onClick={resetForm}>Cancel</button>
              <button onClick={handleAddOrUpdate}>{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </div> 
        </div>
      )}

      {showActivateDeactivatePopup && selectedAccount && (
        <div className="popup-overlay">
          <div className="popup-content">
            {selectedAccount.status === 'active' ? (
              <>
                <h3>Deactivate {selectedAccount.name}?</h3>
                <p>Reason for deactivation:</p>
                <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                  <option value="">Select Reason</option>
                  {reasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
                <p>Admin Approval Required:</p>
                <input 
                  type="email" 
                  name="email" 
                  value={adminAuth.email} 
                  onChange={handleAdminAuthChange} 
                  placeholder="Admin Email" 
                />
                <input 
                  type="password" 
                  name="password" 
                  value={adminAuth.password} 
                  onChange={handleAdminAuthChange} 
                  placeholder="Admin Password" 
                />
                <div className="popup-actions">
                  <button onClick={() => {
                    setShowActivateDeactivatePopup(false);
                    setSelectedReason("");
                    setAdminAuth({ email: '', password: '' });
                  }}>Cancel</button>
                  <button className="deactivate" onClick={handleStatusChange}>Deactivate</button>
                </div>
              </>
            ) : (
              <>
                <h3>Activate {selectedAccount.name}?</h3>
                <p>Are you sure you want to activate this account?</p>
                <div className="popup-actions">
                  <button onClick={() => setShowActivateDeactivatePopup(false)}>Cancel</button>
                  <button className="activate" onClick={handleStatusChange}>Activate</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAddConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Add</h3>
            <p>Are you sure you want to add <strong>{formData.name}</strong> as a new user?</p>
            <div className="popup-actions">
              <button onClick={() => setShowAddConfirmPopup(false)}>Cancel</button>
              <button onClick={confirmAdd}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update this user's information?</p>
            <div className="popup-actions">
              <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
              <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}