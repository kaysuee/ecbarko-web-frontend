import { useEffect, useState, useMemo } from "react";
import '../../styles/TicketClerks.css';
import profile from '../../assets/imgs/profile.png';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import { generateTicketClerksPDF } from '../../utils/pdfUtils'; 
import { useSelector } from 'react-redux';

export default function TicketClerks() {
  const user = useSelector((state) => state.Auth.user);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');

  const [formPopupOpen, setFormPopupOpen] = useState(false);
  const [formPopupReset, setFormPopupReset] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', clerkId: '' });

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);
  const [newpassword, setNewpassword] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const reasons = ["Policy Violation", "Inactivity", "Other"];
  const [superAdminAuth, setSuperAdminAuth] = useState({
    email: '',
    password: ''
  });


  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await get('/api/ticketclerks');
      setAccounts(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load accounts');
    }
  };

  const generateNewClerkId = () => {
    const ids = accounts
      .map(acc => acc.clerkId)
      .filter(id => id.startsWith('TC'))
      .map(id => parseInt(id.slice(2), 10))
      .filter(num => !isNaN(num));
    const max = ids.length ? Math.max(...ids) : 0;
    return `TC${(max + 1).toString().padStart(3, '0')}`;
  };

  const handleSearchChange = e => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortField(e.target.value);
  const resetSorting = () => {
    setSortField('');
    setSearchTerm('');
  };

  const handleSuperAdminAuthChange = (e) =>
    setSuperAdminAuth({ ...superAdminAuth, [e.target.name]: e.target.value });

  const displayedAccounts = useMemo(() => {
    let list = [...accounts];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.clerkId.toLowerCase().includes(term)
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
          if (sortField === 'clerkId') return a.clerkId.localeCompare(b.clerkId);
          if (sortField === 'active') return (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1);
          if (sortField === 'deactivated') return (a.status === 'deactivated' ? 0 : 1) - (b.status === 'deactivated' ? 0 : 1);
          return 0;
        });
      }
    }
    return list;
  }, [accounts, searchTerm, sortField]);

  const openForm = (account = null) => {
    if (account && account._id) {
      setEditId(account._id);
      setFormData({ name: account.name, email: account.email, clerkId: account.clerkId });
      setIsEditing(true);
    } else {
      setEditId(null);
      setFormData({ name: '', email: '', clerkId: generateNewClerkId() });
      setIsEditing(false);
    }
    setFormPopupOpen(true);
  };

  const resetForm = (account = null) => {
    if (account && account._id) {
      setEditId(account._id);
      setFormData({ name: account.name, email: account.email, clerkId: account.clerkId });
      setIsEditing(true);
    } else {
      setEditId(null);
      setIsEditing(false);
    }
    setFormPopupReset(true);
  };

  const handleInputChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddOrUpdate = e => {
    e.preventDefault();
    if (isEditing) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
  try {
    await post('/api/ticketclerks', formData);
    fetchAccounts();
    toast.success('Invitation email sent to clerk');
  } catch (err) {
    console.error('Add error:', err.response?.data || err);
    if (err.response?.status === 400 && err.response?.data?.error === "Email already exists") {
      toast.error("This email is already registered. Please use another one.");
    } else {
      toast.error(err.response?.data?.error || 'Failed to add account');
    }
  } finally {
    closeForm();
    setShowAddConfirmPopup(false);
  }
};



  const AddAudit = async (status = '', ids='') => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt ='';
    if (status === 'password') {
      actiontxt = 'Update Password: ' + formData.clerkId;
    }else if (status === 'status') {
      actiontxt = 'Changed Status TicketClerk: ' + ids + ' to ' + (selectedAccount.status == "Deactivated" ? 'Active' : 'Deactivated');
    }else{
      actiontxt = (isEditing ? 'Updated TicketClerk: ' : 'Added TicketClerk: ') + formData.clerkId;
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
      const res = await put(`/api/ticketclerks/${editId}`, formData);
      setAccounts(prev => prev.map(u => u._id === editId ? res.data : u));
      AddAudit();
      toast.success('Account updated!');
    } catch (err) {
      console.error('Edit error:', err.response?.data || err);
      if (err.response?.status === 400 && err.response?.data?.error === "Email already exists") {
        toast.error("This email is already registered. Please use another one.");
      } else {
        toast.error('Failed to update account');
      }
    } finally {
      closeForm();
      setShowEditConfirmPopup(false);
    }
  };


  const handleReset = () => {
    if (!accounts) {
      toast.error("No account selected");
      return;
    }
    
    if (!superAdminAuth.email || !superAdminAuth.password) {
      toast.error("Please provide super admin credentials");
      return;
    }
    console.log("superAdminAuth:", superAdminAuth);
    console.log("user:", user);
    if (superAdminAuth.email !== user.email || superAdminAuth.password !== user.password) {
      toast.error("Invalid super admin credentials");
      return;
    }

    updatePassword(formData.clerkId, newpassword);
    closeFormReset();
  };

  const updatePassword = async (id, newPassword) => {
    try {
      console.log("id", id);
      console.log("newPassword:", newPassword);
     
      const res = await put(`/api/ticketclerks/${id}/password`, { password: newPassword });
      
      console.log("=== PASSWORD UPDATE RESPONSE ===");
      console.log("Status:", res);
      AddAudit('password');
      toast.success(`Account New Password successfully changed`);
      setSuperAdminAuth({ email: '', password: '' });
      setNewpassword('');
      closeFormReset();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to change status');
    }
  }

  const closeForm = () => {
    setFormPopupOpen(false);
    setEditId(null);
    setIsEditing(false);
    setFormData({ name: '', email: '', clerkId: '' });
  };

  const closeFormReset = () => {
    setFormPopupReset(false);
    setEditId(null);
    setIsEditing(false);
  };

  const handleStatusClick = account => {
    setSelectedAccount(account);
    if (account.status === 'active') {
      setShowDeactivatePopup(true);
      setShowActivatePopup(false);
    } else {
      setShowActivatePopup(true);
      setShowDeactivatePopup(false);
    }
  };

  const updateStatus = async (id, newStatus, reasonText = '') => {
    try {
      if((user.email !== superAdminAuth.email || user.password !== superAdminAuth.password) && selectedAccount.status === 'active') {
        toast.error('Super Admin authentication failed');
        setSuperAdminAuth({ email: '', password: '' });
        return;
      }
      const res = await put(`/api/ticketclerks/${id}`, { status: newStatus, reason: reasonText });
      setAccounts(prev => prev.map(u => u._id === id ? res.data : u));
      AddAudit('status', id);
      toast.success(`Account ${newStatus}`);
      setShowDeactivatePopup(false);
      setShowActivatePopup(false);
      setSelectedAccount(null);
      setSelectedReason('');
    } catch (err) {
      console.error('Status error:', err);
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPDF = () => {
    generateTicketClerksPDF(displayedAccounts, 'ticket-clerks-report');
  };

  return (
    <div className="content">
      <Toaster position="top-center" />
      <main>
        <div className="head-title">
          <div className="left">
            <h1>Ticket Clerks</h1>
            <ul className="breadcrumb"><li><a href="#">Ticket Clerks</a></li></ul>
          </div>
          <a href="#" className="btn-download" onClick={handleDownloadPDF}>
            <i className="bx bxs-cloud-download"></i>
            <span className="text">Download PDF</span>
          </a>
        </div>

        <div className="table-data">
          <div className="order">
            <div className="head">
              <h3>Ticket Clerks</h3>
              <div className="search-container">
              <input
                type="text"
                placeholder="Search accounts..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="bx bx-search"></i>
              </div>
              <select className="sort-select" value={sortField} onChange={handleSortChange}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="clerkId">Clerk ID</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
              <i
                className="bx bx-reset"
                onClick={resetSorting}
                title="Reset Filters and Sort"
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              ></i>
              <i className="bx bx-plus" onClick={() => openForm()}></i>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Clerk ID</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {displayedAccounts.map(account => (
                  <tr key={account._id}>
                    <td>
                      <div className="avatar">
                        {account.profileImage ? (
                          <img 
                            src={
                              account.profileImage.startsWith('http') 
                                ? account.profileImage 
                                : `https://ecbarko-back.onrender.com${account.profileImage}`
                            } 
                            alt="Profile" 
                            className="profile-img" 
                          />
                        ) : (
                          <div className="initial-avatar">
                            {account.name ? account.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                      </div>
                      <span>{account.name}</span>
                    </td>
                    <td>{account.clerkId}</td>
                    <td>{account.email}</td>
                    <td>*************</td>
                    <td>
                      <span
                        className={`status ${account.status}`}
                        onClick={() => handleStatusClick(account)}
                        style={{ cursor: 'pointer' }}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td>
                      <i className="bx bx-pencil" style={{ cursor: 'pointer'}} onClick={() => openForm(account)}></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formPopupOpen && (
            <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setFormPopupOpen(false); }}>
              <div className="popup-content ticketclerk-form">
              <h3>{isEditing ? 'Edit Ticket Clerk' : 'Add Ticket Clerk'}</h3>
              <form onSubmit={handleAddOrUpdate}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="clerkId"
                  placeholder="Clerk ID"
                  value={formData.clerkId}
                  readOnly
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <div className="popup-actions">
                  <button type="button" onClick={closeForm}>Cancel</button>
                  <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {formPopupReset && (
          <div className="popup-overlay">
            <div className="popup-content">
            <h3>Reset {formData.name} Password?</h3>
            <p>New Password</p>
            <input 
              type="password" 
              name="Newpassword" 
              value={newpassword} 
              onChange={(e) => setNewpassword(e.target.value)} 
              placeholder="New Password" 
            />
            <p>Super Admin Approval Required:</p>
            <input 
              type="email" 
              name="email" 
              value={superAdminAuth.email} 
              onChange={handleSuperAdminAuthChange} 
              placeholder="Super Admin Email" 
            />
            <input 
              type="password" 
              name="password" 
              value={superAdminAuth.password} 
              onChange={handleSuperAdminAuthChange} 
              placeholder="Super Admin Password" 
            />
            <div className="popup-actions">
              <button onClick={() => {
                setNewpassword('');
                closeFormReset();
                setSuperAdminAuth({ email: '', password: '' });
              }}>Cancel</button>
              <button className="archive" onClick={handleReset}>Reset Password</button>
            </div>
          </div>
           </div>
        )}

        {showAddConfirmPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Confirm Add</h3>
              <p>Are you sure you want to add <strong>{formData.name}</strong>?</p>
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
              <p>Are you sure you want to update this account?</p>
              <div className="popup-actions">
                <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
                <button onClick={confirmEdit} className="confirm">Yes, Update</button>
              </div>
            </div>
          </div>
        )}

        {showDeactivatePopup && selectedAccount && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Deactivate {selectedAccount.name}?</h3>
              <p>Reason for deactivation:</p>
              <select value={selectedReason} onChange={e => setSelectedReason(e.target.value)}>
                <option value="">Select Reason</option>
                {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
              </select>
              <p>Super Admin Approval Required:</p>
                <input 
                  type="email" 
                  name="email" 
                  value={superAdminAuth.email} 
                  onChange={handleSuperAdminAuthChange} 
                  placeholder="Super Admin Email" 
                />
                <input 
                  type="password" 
                  name="password" 
                  value={superAdminAuth.password} 
                  onChange={handleSuperAdminAuthChange} 
                  placeholder="Super Admin Password" 
                />
                 <div className="popup-actions">
                  <button onClick={() => {
                    setShowDeactivatePopup(false);
                    setSelectedReason("");
                    setSuperAdminAuth({ email: '', password: '' });
                  }}>Cancel</button>
                  <button className="deactivate" onClick={() => updateStatus(selectedAccount._id, 'deactivated', selectedReason)}>Deactivate</button>
                </div>
            </div>
          </div>
        )}

        {showActivatePopup && selectedAccount && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Activate {selectedAccount.name}?</h3>
              <p>Are you sure you want to activate this account?</p>
              <div className="popup-actions">
                <button onClick={() => setShowActivatePopup(false)}>Cancel</button>
                <button className="activate" onClick={() => updateStatus(selectedAccount._id, 'active')}>Activate</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}