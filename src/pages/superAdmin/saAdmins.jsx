import { useEffect, useState, useRef, useMemo } from "react";
import '../../styles/Admins.css';
import '../../styles/table-compression.css';
import profile from '../../assets/imgs/profile.png';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import { generateAdminsPDF } from '../../utils/pdfUtils'; 

const Admins = () => {
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');
  const [showPopup, setShowPopup] = useState(false);
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [archivedSearchTerm, setArchivedSearchTerm] = useState('');
  const [filteredArchivedAccounts, setFilteredArchivedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);
  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [formPopupOpen, setFormPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
   const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    adminId: '',
    status: 'active',
    shippingLines: '', // Add shipping lines field
  });

  // Only email is required now for approvals
  const [superAdminAuth, setSuperAdminAuth] = useState({
    email: ''
  });

  const [newpassword, setNewpassword] = useState('');
  const activeTableRef = useRef(null);
  const archivedTableRef = useRef(null);

  const reasons = ["Policy Violation", "Inactivity", "Other"];

  const fetchAdmins = async () => {
    try {
      console.log("Fetching admins with token authentication");
      const res = await get("/api/sa-admins");
      
      console.log("=== FETCH ADMINS RESPONSE ===");
      console.log("Response data:", res.data);
      
      const adminOnly = res.data.filter(account => account.role === "admin");
      console.log("Admin accounts found:", adminOnly.length);
      console.log("Admin accounts:", adminOnly.map(a => ({ id: a._id, name: a.name, status: a.status })));
      
      const activeAccounts = adminOnly.filter(account => account.status !== "archived");
      const archivedAccounts = adminOnly.filter(account => account.status === "archived");
      
      console.log("Active accounts:", activeAccounts.length);
      console.log("Archived accounts:", archivedAccounts.length);
      
      setAccounts(activeAccounts);
      setArchivedAccounts(archivedAccounts);
      setFilteredArchivedAccounts(archivedAccounts);

    } catch (err) {
      console.error("Error fetching admins:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to fetch admin data");
      }
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSortChange = (e) => setSortField(e.target.value);
  const resetSorting = () => {
    setSortField('');
    setSearchTerm('');
  };

  const displayedAccounts = useMemo(() => {
    let list = [...accounts];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(account =>
        account.name.toLowerCase().includes(term) ||
        account.email.toLowerCase().includes(term) ||
        account.adminId.toLowerCase().includes(term)
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
          if (sortField === 'adminId') return a.adminId.localeCompare(b.adminId);
          if (sortField === 'role') return a.role.localeCompare(b.role);
          if (sortField === 'active') return (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1);
          if (sortField === 'deactivated') return (a.status === 'deactivated' ? 0 : 1) - (b.status === 'deactivated' ? 0 : 1);
          if (sortField === 'archived') return (a.status === 'archived' ? 0 : 1) - (b.status === 'archived' ? 0 : 1);
          return 0;
        });
      }
    }
    return list;
  }, [accounts, searchTerm, sortField]);

  const handleArchivedSearchChange = (e) => {
    setArchivedSearchTerm(e.target.value);
  };
  
  useEffect(() => {
    const filtered = archivedAccounts.filter(account =>
      account.name.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      account.adminId.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    );
    setFilteredArchivedAccounts(filtered);
  }, [archivedSearchTerm, archivedAccounts]);
  
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSuperAdminAuthChange = (e) =>
    setSuperAdminAuth({ ...superAdminAuth, [e.target.name]: e.target.value });

  const handleStatusClick = (account) => {
    setSelectedAccount(account);
    if (account.status === "deactivated") setShowActivatePopup(true);
    else if (account.status === "active") setShowPopup(true);
  };

  const updatePassword = async (id, newPassword) => {
    try {
      console.log("id", id);
      console.log("newPassword:", newPassword);
      const res = await put(`/api/users/${id}/password`, { password: newPassword });
      setTimeout(async () => {
        await fetchAdmins();
      }, 1000);
      console.log("=== PASSWORD UPDATE RESPONSE ===");
      console.log("Status:", res);
      toast.success(`Account New Password successfully changed`);
      setSuperAdminAuth({ email: '' });
      setNewpassword('');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to change status');
    }
  }

  const updateStatus = async (id, newStatus, reason = "") => {
    try {
      console.log("=== FRONTEND UPDATE STATUS DEBUG ===");
      console.log("Admin ID:", id);
      console.log("New status:", newStatus);
      console.log("Reason:", reason);
      console.log("Super admin auth:", {
        email: superAdminAuth.email ? "provided" : "missing"
      });

      const currentAdmin = accounts.find(acc => acc._id === id) || archivedAccounts.find(acc => acc._id === id);
      console.log("Current admin in state:", currentAdmin);

      const requestData = {
        status: newStatus,
        reason: reason || ""
      };

      // For deactivation/archive/restore flows, only email is required now
      if (newStatus === 'deactivated' || newStatus === 'archived') {
        if (!superAdminAuth.email) {
          toast.error("Super admin email is required");
          return;
        }
        requestData.superAdminEmail = superAdminAuth.email;
      }

      if (newStatus === 'active' && currentAdmin && currentAdmin.status === 'archived') {
        if (!superAdminAuth.email) {
          toast.error("Super admin email is required to restore archived accounts");
          return;
        }
        requestData.superAdminEmail = superAdminAuth.email;
      }

      console.log("Request payload:", requestData);

      let response;
      let endpointUsed = "";
      
      try {
        endpointUsed = `/api/sa-admins/${id}/status`;
        console.log("Trying endpoint 1:", endpointUsed);
        response = await put(endpointUsed, requestData);
      } catch (firstError) {
        console.log("First endpoint failed, trying alternative...");
        try {
          endpointUsed = `/api/admin/admin-status/${id}`;
          console.log("Trying endpoint 2:", endpointUsed);
          response = await put(endpointUsed, requestData);
        } catch (secondError) {
          console.log("Second endpoint failed, trying third...");
          try {
            endpointUsed = `/api/sa-admins/status/${id}`;
            console.log("Trying endpoint 3:", endpointUsed);
            response = await put(endpointUsed, requestData);
          } catch (thirdError) {
            endpointUsed = `/api/sa-admins/${id}`;
            console.log("Trying endpoint 4:", endpointUsed);
            response = await put(endpointUsed, requestData);
          }
        }
      }
      
      console.log("=== SERVER RESPONSE ===");
      console.log("Successful endpoint:", endpointUsed);
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      console.log("Updated admin:", response.data.admin);
      console.log("Verification data:", response.data.verification);
      
      if (response.data.admin) {
        console.log("Admin status after update:", response.data.admin.status);
        console.log("Admin reason after update:", response.data.admin.reason);
      }
      
      if (response.data.verification && !response.data.verification.updateSuccessful) {
        console.error("UPDATE FAILED - Status did not change in database");
        toast.error("Status update failed - please check server logs");
        return;
      }
      
      console.log("Waiting 1 second before refreshing admin list...");
      setTimeout(async () => {
        await fetchAdmins();
      }, 1000);
      
      toast.success(`Account ${newStatus} successfully`);
      setSuperAdminAuth({ email: '' });
      
    } catch (err) {
      console.error("=== UPDATE ERROR ===");
      console.error("Error:", err);
      console.error("Error response:", err.response);
      
      if (err.response) {
        console.error("Server error status:", err.response.status);
        console.error("Server error data:", err.response.data);
        
        if (err.response.status === 401) {
          toast.error("Invalid super admin credentials or session expired");
        } else if (err.response.status === 404) {
          toast.error("API endpoint not found. The backend route may not exist.");
          console.error("BACKEND ISSUE: You may need to add a route to handle admin status updates");
        } else if (err.response.status === 403) {
          toast.error("Access denied. Check super admin permissions.");
        } else {
          const errorMessage = err.response.data?.message || `Request failed with status ${err.response.status}`;
          toast.error(errorMessage);
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Request setup error:", err.message);
        toast.error("Failed to send request: " + err.message);
      }
    }
  };

  const handleSuspend = () => {
    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }
    
    if (!selectedReason) {
      toast.error("Please select a reason for deactivation");
      return;
    }
    
    if (!superAdminAuth.email) {
      toast.error("Please provide super admin email");
      return;
    }

    updateStatus(selectedAccount._id, "deactivated", selectedReason);
    setShowPopup(false);
    setSelectedReason("");
  };

  const handleActivate = () => {
    if (selectedAccount) {
      updateStatus(selectedAccount._id, "active"); 
      setShowActivatePopup(false);
    }
  };  

  const handleArchive = () => {
    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }
    
    if (!superAdminAuth.email) {
      toast.error("Please provide super admin email");
      return;
    }

    updateStatus(selectedAccount._id, "archived");
    setShowArchivePopup(false);
  };

  const handleReset = () => {
    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }
    
    if (!superAdminAuth.email) {
      toast.error("Please provide super admin email");
      return;
    }

    updatePassword(selectedAccount.adminId, newpassword);
    setShowResetPopup(false);
  };

  const handleRestore = async (account) => {
    setSelectedAccount(account);
    setShowRestorePopup(true);
  };

  const confirmRestore = () => {
    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }
    
    if (!superAdminAuth.email) {
      toast.error("Please provide super admin email");
      return;
    }

    updateStatus(selectedAccount._id, "active");
    setShowRestorePopup(false);
  };
  
   const openForm = (account = null) => {
    setFormPopupOpen(true);
    if (account) {
      setEditId(account._id);
      setFormData({
        name: account.name,
        email: account.email,
        shippingLines: account.shippingLines || '',
        // Remove password field for editing
      });
    } else {
      setEditId(null);
      setFormData({
        name: '',
        email: '',
        shippingLines: '',
        // Remove password field for adding new admin
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      setShowEditConfirmPopup(true); 
    } else {
      setShowAddConfirmPopup(true); 
    }
  };

  const confirmAdd = async () => {
    try {
      // Send name, email, and shippingLines - password will be set via email invitation
      const { name, email, shippingLines } = formData;
      
      if (!name || !email || !shippingLines) {
        toast.error("Please fill in all required fields including shipping lines.");
        return;
      }
      
      await post("/api/sa-admins", { name, email, shippingLines });
      toast.success("Admin invitation sent! They will receive an email to set up their account.");
      setFormPopupOpen(false);
      setShowAddConfirmPopup(false);
      fetchAdmins();
    } catch (err) {
      console.error("Error adding admin:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (err.response?.status === 400 && err.response.data?.error === "Email already exists.") {
        toast.error("An admin with this email already exists.");
      } else if (err.response?.status === 400) {
        toast.error(err.response.data?.error || "Failed to send admin invitation.");
      } else {
        toast.error("Failed to send admin invitation.");
      }
      setShowAddConfirmPopup(false);
    }
  };

  const confirmEdit = async () => {
    try {
      const { name, email, shippingLines } = formData;
      
      if (!name || !email || !shippingLines) {
        toast.error("Please fill in all required fields including shipping lines.");
        return;
      }
      
      await put(`/api/sa-admins/${editId}`, { name, email, shippingLines });
      toast.success("Admin updated!");
      setFormPopupOpen(false);
      setShowEditConfirmPopup(false);
      fetchAdmins();
    } catch (err) {
      console.error("Error updating admin:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to update admin.");
      }
      setShowEditConfirmPopup(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadPDF = () => {
    generateAdminsPDF(displayedAccounts, 'admins-report');
  };

  return (
    <div className="content">
      <Toaster position="top-center" />
      <main>
        <div className="head-title">
          <div className="left">
            <h1>Admins</h1>
            <ul className="breadcrumb">
              <li><a href="#">Admins</a></li>
            </ul>
          </div>
          <a href="#" className="btn-download" onClick={handleDownloadPDF}>
            <i className="bx bxs-cloud-download"></i>
            <span className="text">Download PDF</span>
          </a>
        </div>

        <div className="table-data">
          <div className="order">
            <div className="head">
              <h3>Admins</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search accounts..."
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
                <option value="adminId">Admin ID</option>
                <option value="role">Role</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
                <option value="archived">Archived</option>
              </select>
              <i
                className="bx bx-reset"
                onClick={fetchAdmins}
                title="Reload Admins"
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              ></i>
              <i className="bx bx-plus" onClick={() => openForm()}></i>
            </div>
            <div className="wide-table-container">
              <table ref={activeTableRef} className="wide-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "200px" }}>Admin Name</th>
                    <th style={{ minWidth: "120px" }}>Admin ID</th>
                    <th style={{ minWidth: "200px" }}>Email</th>
                    <th style={{ minWidth: "150px" }}>Shipping Lines</th>
                    <th style={{ minWidth: "120px" }}>Password</th>
                    <th style={{ minWidth: "100px" }}>Role</th>
                    <th style={{ minWidth: "100px" }}>Status</th>
                    <th style={{ minWidth: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAccounts.map((account) => (
                    <tr key={account._id}>
                      <td className="admin-name-cell">
                        <div className="admin-info">
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
                          <span className="admin-name">{account.name}</span>
                        </div>
                      </td>
                      <td>{account.adminId}</td>
                      <td className="email-cell" title={account.email}>{account.email}</td>
                      <td className="shipping-cell" title={account.shippingLines}>{account.shippingLines}</td>
                      <td>*************</td>
                      <td>{account.role}</td>
                      <td>
                        <span
                          className={`status ${account.status}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleStatusClick(account)}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <i
                            className="bx bx-edit edit-btn"
                            onClick={() => openForm(account)}
                            style={{ cursor: 'pointer' }}
                            title="Edit Admin"
                          ></i>
                          <i
                            className="bx bx-archive archive-btn"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowArchivePopup(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Archive Admin"
                          ></i>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {formPopupOpen && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setFormPopupOpen(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>{editId ? "Edit Admin" : "Add Admin"}</h3>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Full Name" 
              required
            />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="Email" 
              required
            />
            <input 
              type="text" 
              name="shippingLines" 
              value={formData.shippingLines} 
              onChange={handleInputChange} 
              placeholder="Shipping Lines" 
              required
            />
            {/* Remove password field - admin will set password via email invitation */}
            {!editId && (
              <div className="info-message">
                <small>
                  <i className="bx bx-info-circle"></i>
                  An invitation email will be sent to the admin to set up their password.
                </small>
              </div>
            )}
            <div className="popup-actions">
              <button onClick={() => setFormPopupOpen(false)}>Cancel</button>
              <button onClick={handleFormSubmit}>{editId ? "Update" : "Send Invitation"}</button>
            </div>
          </div>
        </div>
      )}  

      {showPopup && selectedAccount && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Deactivate {selectedAccount.name}?</h3>
            <p>Reason for deactivation:</p>
            <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
              <option value="">Select Reason</option>
              {reasons.map((reason, idx) => (
                <option key={idx} value={reason}>{reason}</option>
              ))}
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
                setShowPopup(false);
                setSelectedReason("");
                setSuperAdminAuth({ email: '' });
              }}>Cancel</button>
              <button className="deactivate" onClick={handleSuspend}>Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {showActivatePopup && selectedAccount && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowActivatePopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Activate {selectedAccount.name}?</h3>
            <p>Are you sure you want to activate this account?</p>
            <div className="popup-actions">
              <button onClick={() => setShowActivatePopup(false)}>Cancel</button>
              <button className="activate" onClick={handleActivate}>Activate</button>
            </div>
          </div>
        </div>
      )}

      {showArchivePopup && selectedAccount && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowArchivePopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Archive {selectedAccount.name}?</h3>
            <p>Super Admin Approval Required:</p>
            <input 
              type="email" 
              name="email" 
              value={superAdminAuth.email} 
              onChange={handleSuperAdminAuthChange} 
              placeholder="Super Admin Email" 
            />
            <div className="popup-actions">
              <button onClick={() => {
                setShowArchivePopup(false);
                setSuperAdminAuth({ email: '' });
              }}>Cancel</button>
              <button className="archive" onClick={handleArchive}>Archive</button>
            </div>
          </div>
        </div>
      )}

      {showResetPopup && selectedAccount && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowResetPopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Reset Password {selectedAccount.name}?</h3>
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
            <div className="popup-actions">
              <button onClick={() => {
                setNewpassword('');
                setShowResetPopup(false);
                setSuperAdminAuth({ email: '' });
              }}>Cancel</button>
              <button className="archive" onClick={handleReset}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {showRestorePopup && selectedAccount && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowRestorePopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Restore {selectedAccount.name}?</h3>
            <p>Super Admin Approval Required:</p>
            <input 
              type="email" 
              name="email" 
              value={superAdminAuth.email} 
              onChange={handleSuperAdminAuthChange} 
              placeholder="Super Admin Email" 
            />
            <div className="popup-actions">
              <button onClick={() => {
                setShowRestorePopup(false);
                setSuperAdminAuth({ email: '' });
              }}>Cancel</button>
              <button className="activate" onClick={confirmRestore}>Restore</button>
            </div>
          </div>
        </div>
      )}

      {showAddConfirmPopup && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowAddConfirmPopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Admin Invitation</h3>
            <p>Are you sure you want to send an invitation to <strong>{formData.name}</strong> ({formData.email})?</p>
            <p><strong>Shipping Lines:</strong> {formData.shippingLines}</p>
            <p><small>They will receive an email with instructions to set up their admin account.</small></p>
            <div className="popup-actions">
              <button onClick={() => setShowAddConfirmPopup(false)}>Cancel</button>
              <button onClick={confirmAdd}>Send Invitation</button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirmPopup && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setShowEditConfirmPopup(false); }}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update this admin's information?</p>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Shipping Lines:</strong> {formData.shippingLines}</p>
            <div className="popup-actions">
              <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
              <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
