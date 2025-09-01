import '../../styles/ecBarko-card.css';
import profile from '../../assets/imgs/profile.png';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { generateTablePDF } from '../../utils/pdfUtils';
import { useSelector } from 'react-redux';
import { get, post, put } from '../../services/ApiEndpoint';

export default function AdminEcBarkoCard() {
  
  const user = useSelector((state) => state.Auth.user);
  const [accounts, setAccounts] = useState([]);
  const [showAddEditPopup, setShowAddEditPopup] = useState(false);
  const [showActivateDeactivatePopup, setShowActivateDeactivatePopup] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [formData, setFormData] = useState({ name: '', cardNumber: '', balance: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState(null); 

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  const reasons = ['Lost Card', 'Other'];

  const formatBalance = (balance) => {
    const num = typeof balance === 'string'
      ? parseFloat(balance.replace(/[^\d.-]/g, ''))
      : balance;
    if (isNaN(num)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency', currency: 'PHP',
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(num);
  };

  useEffect(() => {
    axios.get('http://localhost:4000/api/cards', { withCredentials: true })
      .then((res) => setAccounts(res.data))
      .catch((err) => console.error('Error fetching cards:', err));
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortClick = () => setSortMode((prev) => (prev === null ? 0 : prev === 0 ? 1 : null));
  const resetSorting = () => setSortMode(null);
  const [superAdminAuth, setSuperAdminAuth] = useState({
    email: '',
    password: ''
  });
  const handleSuperAdminAuthChange = (e) =>
    setSuperAdminAuth({ ...superAdminAuth, [e.target.name]: e.target.value });

  const displayedAccounts = useMemo(() => {
    let list = [...accounts];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(term) || a.cardNumber.toLowerCase().includes(term)
      );
    }
    if (sortMode !== null) {
      list.sort((a, b) => {
        const rankA = sortMode === 0 ? (a.status === 'active' ? 0 : 1) : (a.status === 'deactivated' ? 0 : 1);
        const rankB = sortMode === 0 ? (b.status === 'active' ? 0 : 1) : (b.status === 'deactivated' ? 0 : 1);
        return rankA - rankB;
      });
    }
    return list;
  }, [accounts, searchTerm, sortMode]);

  const toggleStatus = (account) => {
    setSelectedAccount(account);
    setSelectedReason('');
    setShowActivateDeactivatePopup(true);
  };

  const updateStatus = async (id, status) => {
    try {
      
      const res = await axios.put(
        `http://localhost:4000/api/cards/${id}`,
        { status }, { withCredentials: true }
      );
      setAccounts((prev) => prev.map((a) => (a._id === id ? res.data : a)));
      AddAudit('status', id, status);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to change status');
    }
  };

  const handleDeactivate = () => {
    if (selectedAccount && selectedReason) {
      if((user.email !== superAdminAuth.email || user.password !== superAdminAuth.password) && selectedAccount.status === 'active') {
        toast.error('Super Admin authentication failed');
        setSuperAdminAuth({ email: '', password: '' });
        return;
      }
      updateStatus(selectedAccount._id, 'deactivated');
      setShowActivateDeactivatePopup(false);
      toast.success(`${selectedAccount.name} deactivated`);
    } else {
      toast.error('Please select a reason');
    }
  };

  const handleActivate = () => {
    if (selectedAccount) {
      updateStatus(selectedAccount._id, 'active');
      setShowActivateDeactivatePopup(false);
      toast.success(`${selectedAccount.name} activated`);
    }
  };
  
  const handleAddOrUpdate = () => {
    if (isEditing) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    try {
      const formatted = parseFloat(formData.balance.replace(/[^\d.-]/g, '')) || 0;
      const payload = { ...formData, balance: formatted, status: 'active', userId:"N/A"};
      const res = await axios.post(
        'http://localhost:4000/api/cards', payload,
        { withCredentials: true }
      );
      setAccounts((prev) => [...prev, res.data]);
      AddAudit();
      toast.success('Account added successfully!');
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to add account');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  const AddAudit = async (status = '', ids='' , ecbarkostat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt ='';
    if (status === 'status') {
      actiontxt = 'Changed Status EcBarko: ' + ids + ' to ' + (ecbarkostat == "deactivated" ? 'Active' : 'Deactivated');
    }else{
      actiontxt = (isEditing ? 'Updated EcBarko: ' : 'Added EcBarko: ') + formData.name;
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
      const formatted = parseFloat(formData.balance.replace(/[^\d.-]/g, '')) || 0;
      const payload = { ...formData, balance: formatted };
      const res = await axios.put(
        `http://localhost:4000/api/cards/${selectedAccount._id}`,
        payload, { withCredentials: true }
      );
      setAccounts((prev) => prev.map((a) => (a._id === selectedAccount._id ? res.data : a)));
      AddAudit();
      toast.success('Account updated successfully!');
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to update account');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const startEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      cardNumber: account.cardNumber,
      balance: account.balance,
      type: account.type,
    });
    setIsEditing(true);
    setShowAddEditPopup(true);
  };

  const resetForm = () => {
    setFormData({ name: '', cardNumber: '', balance: '', type: '' });
    setSelectedAccount(null);
    setIsEditing(false);
    setShowAddEditPopup(false);
  };

  const handleDownloadPDF = () => {
    generateTablePDF('.card-table table', 'ecbarko-cards-report', 'EcBarko Card Report');
  };

  return (
    <div className="ecbarko">
      <main>
        <div className="head-title">
          <div className="left">
            <h1>EcBarko Card</h1>
            <ul className="breadcrumb"><li><a href="#">Cards</a></li></ul>
          </div>
          <a href="#" className="btn-download" onClick={handleDownloadPDF}>
            <i className="bx bxs-cloud-download"></i>
            <span className="text">Download PDF</span>
          </a>
        </div>
        <div className="card-table">
          <div className="order">
            <div className="head">
              <h3>EcBarko Cards</h3>
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
              <i className="bx bx-sort" onClick={handleSortClick} title="Sort by Status"></i>
              <i className="bx bx-reset" onClick={resetSorting} title="Reset to Default"></i>
              <i className="bx bx-plus" onClick={() => { resetForm(); setShowAddEditPopup(true); }}></i>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>User ID</th>
                  <th>Card Number</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>
                      <div className="avatar">
                        <div className="initial-avatar">
                          {account.name ? account.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      </div>
                      <span>{account.name}</span>
                    </td>
                    <td>{account.userId}</td>
                    <td>{account.cardNumber}</td>
                    <td>{formatBalance(account.balance)}</td>
                    <td>
                      <span
                        className={`status ${account.status}`}
                        onClick={() => toggleStatus(account)}
                        style={{ cursor: 'pointer' }}
                        title={`Click to ${account.status === 'active' ? 'deactivate' : 'activate'}`}
                      >{account.status}</span>
                    </td>
                    <td>
                      <i className="bx bx-pencil" onClick={() => startEdit(account)} style={{ cursor: 'pointer' }}></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Toaster position="top-center" />

      {showAddEditPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{isEditing ? 'Edit Account' : 'Add New Account'}</h3>
            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input type="text" placeholder="Card Number" value={formData.cardNumber} onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })} />
            <input type="text" placeholder="Balance" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} />
            <input type="text" placeholder="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
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
                    setShowActivateDeactivatePopup(false)
                    setSelectedReason("");
                    setSuperAdminAuth({ email: '', password: '' });
                  }}>Cancel</button>
                  <button className="deactivate" onClick={handleDeactivate}>Deactivate</button>
                </div>
              </>
            ) : (
              <>
                <h3>Activate {selectedAccount.name}?</h3>
                <div className="popup-actions">
                  <button onClick={() => setShowActivateDeactivatePopup(false)}>Cancel</button>
                  <button className="activate" onClick={handleActivate}>Activate</button>
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
              <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}