import '../../styles/Users.css';
import profile from '../../assets/imgs/profile.png';
import { useEffect, useState, useMemo } from 'react';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import { generateUsersPDF } from '../../utils/pdfUtils'; 
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
  const [sortField, setSortField] = useState('latest');

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);
  const reasons = ['User requested', 'Inactive for too long', 'Security breach', 'Other'];
  const [AdminAuth, setAdminAuth] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
    get('/api/users')
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Fetch error:', err);
        toast.error('Failed to fetch users');
      });
  }, []);

  const confirmAdd = async () => {
    try {
      const maxId = users.reduce((max, u) => {
        const idNum = parseInt(u.userId.replace('U', ''), 10);
        return !isNaN(idNum) && idNum > max ? idNum : max;
      }, 0);

      const newUserId = `U${String(maxId + 1).padStart(4, '0')}`;

      const payload = { 
        ...formData, 
        userId: newUserId, 
        status: 'active', 
        lastActive: new Date().toISOString() 
      };

      const res = await post('/api/users', payload);
      setUsers((prev) => [...prev, res.data]);
      AddAudit();
      toast.success('User added successfully');
    } catch (err) {
      console.error('Add error:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to add user');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };


  const AddAudit = async (status = '', ids='' , userstat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt ='';
    if (status === 'status') {
      actiontxt = 'Changed Status User: ' + ids + ' to ' + (userstat == "deactivated" ? 'Active' : 'Deactivated');
    }else{
      actiontxt = (isEditing ? 'Updated User: ' : 'Added User: ') + formData.name;
    }
    let action = actiontxt;
    const auditData = {
      date: formattedDate,
      name,
      userID,
      action
    };
  
    try {
      const res = await post('/api/audittrails', auditData);
      console.log('Audit trail added:', res.data);
    } catch (err) {
      console.error('Add audit error:', err);
      toast.error('Failed to add audit trail');
    }
  };

  const confirmEdit = async () => {
    try {
      const res = await put(`/api/users/${editUserId}`, formData);
      setUsers((prev) => prev.map((u) => (u._id === editUserId ? res.data : u)));
      AddAudit();
      toast.success('User updated successfully');
    } catch (err) {
      console.error('Edit error:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const fetchUsers = async () => {
  try {
    const res = await get('/api/users');
    setUsers(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error('Fetch error:', err);
    toast.error('Failed to fetch users');
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
      // Only require auth verification when deactivating an active account
      if (selectedAccount.status === 'active') {
        try {
          const authResponse = await post('/api/admin/verify-auth', {
            email: AdminAuth.email,
            password: AdminAuth.password
          });
          
          if (!authResponse.data.success) {
            toast.error('Admin authentication failed');
            setSelectedReason("");
            setAdminAuth({ email: '', password: '' });
            return;
          }
        } catch (authError) {
          console.error('Auth error:', authError);
          toast.error('Admin authentication failed');
          setSelectedReason("");
          setAdminAuth({ email: '', password: '' });
          return;
        }
      }

      const newStatus = selectedAccount.status === 'deactivated' ? 'active' : 'deactivated';
      const res = await put(`/api/users/${selectedAccount._id}/status`, { status: newStatus, reason: selectedReason });
      setUsers((prev) => prev.map((u) => (u._id === selectedAccount._id ? res.data : u)));
      AddAudit('status', selectedAccount.userId, newStatus);
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
    setAdminAuth({ ...AdminAuth, [e.target.name]: e.target.value });

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
    generateUsersPDF(displayedUsers, 'sa-users-report');
  };

  // Sorting
  const handleSortChange = (e) => setSortField(e.target.value);
  // const resetSorting = () => setSortField('');

  const displayedUsers = useMemo(() => {
    let list = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }
    if (sortField) {
      if (sortField === 'latest') {
        list.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
      } else if (sortField === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
      } else {
        list.sort((a, b) => {
          if (sortField === 'name') return a.name.localeCompare(b.name);
          if (sortField === 'email') return a.email.localeCompare(b.email);
          if (sortField === 'id') return a.userId.localeCompare(b.userId);
          if (sortField === 'active') return (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1);
          if (sortField === 'deactivated') return (a.status === 'deactivated' ? 0 : 1) - (b.status === 'deactivated' ? 0 : 1);
          if (sortField === 'inactive') return (a.status === 'inactive' ? 0 : 1) - (b.status === 'inactive' ? 0 : 1);
          return 0;
        });
      }
    }
    return list;
  }, [users, searchTerm, sortField]);

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
              {/* SORT DROPDOWN + RESET */}
              <select className="sort-select" value={sortField} onChange={handleSortChange}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="id">User ID</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
                <option value="inactive">Inactive</option>
              </select>
              <i
                className="bx bx-reset"
                onClick={fetchUsers}
                title="Reload Users"
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              ></i>
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
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="avatar">
                        <div className="initial-avatar">
                          {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      </div>
                      <span>{user.name}</span>
                    </td>
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
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) resetForm(); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input 
              type="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              readOnly={isEditing}
              style={isEditing ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
            />
            <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div className="popup-actions">
              <button onClick={resetForm}>Cancel</button>
              <button onClick={handleAddOrUpdate}>{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </div> 
        </div>
      )}

      {showActivateDeactivatePopup && selectedAccount && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowActivateDeactivatePopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
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
                  value={AdminAuth.email} 
                  onChange={handleAdminAuthChange} 
                  placeholder="Admin Email" 
                />
                <input 
                  type="password" 
                  name="password" 
                  value={AdminAuth.password} 
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
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowAddConfirmPopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
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
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowEditConfirmPopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
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
