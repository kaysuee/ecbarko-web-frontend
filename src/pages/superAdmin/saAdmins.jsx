import { useEffect, useState, useRef } from "react";
import '../../styles/Admins.css';
import profile from '../../assets/imgs/profile.png';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { generateMultiTablePDF } from '../../utils/pdfUtils';

const Admins = () => {
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [sortActiveFirst, setSortActiveFirst] = useState(true); 
  const [sortOrder, setSortOrder] = useState(null); 
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
  });

  const [superAdminAuth, setSuperAdminAuth] = useState({
    email: '',
    password: ''
  });

  const [newpassword, setNewpassword] = useState('');
  const activeTableRef = useRef(null);
  const archivedTableRef = useRef(null);

  const [filterActive, setFilterActive] = useState(false);
  const reasons = ["Policy Violation", "Inactivity", "Other"];

  const getAuthToken = () => {
    console.log("Using cookie-based authentication");
    console.log("Document cookies:", document.cookie);
    
    const hasTokenCookie = document.cookie.includes('token=');
    console.log("Token cookie present:", hasTokenCookie);
    
    return 'cookie-based'; 
  };

  const getAuthHeaders = () => {
    console.log("Using cookie-based authentication - no manual headers needed");
    
    return {
      'Content-Type': 'application/json'
    };
  };

  const checkAuthStatus = () => {
    const hasTokenCookie = document.cookie.includes('token=');
    if (!hasTokenCookie) {
      toast.error("Please log in first to access this page");
      return false;
    }
    return true;
  };

  axios.defaults.withCredentials = true;

  const fetchAdmins = async () => {
    try {
      console.log("Fetching admins with cookie authentication");
      const res = await axios.get("http://localhost:4000/api/sa-admins");
      
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
      setFilteredAccounts(activeAccounts);
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

  const toggleFilter = () => {
    setFilterActive(!filterActive);
  };

  useEffect(() => {
    let updatedAccounts = [...accounts];
  
    if (filterActive) {
      updatedAccounts = updatedAccounts.filter(account => account.status === 'active');
    }
  
    updatedAccounts.sort((a, b) => {
      if (sortActiveFirst) {
        return a.status === 'active' ? -1 : 1;
      } else {
        return a.status === 'deactivated' ? -1 : 1;
      }
    });
  
    setFilteredAccounts(updatedAccounts);
  }, [filterActive, sortActiveFirst, accounts]);
  
  const toggleSortOrder = () => {
    let newOrder;
    if (sortOrder === 'activeFirst') {
      newOrder = 'deactivatedFirst';
      setFilteredAccounts([...accounts].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'deactivated' ? -1 : 1;
      }));
    } else {
      newOrder = 'activeFirst';
      setFilteredAccounts([...accounts].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'active' ? -1 : 1;
      }));
    }
    setSortOrder(newOrder);
  };
  
  const resetSorting = () => {
    setSortOrder(null);
    setSearchTerm('');
    setFilterActive(false);
    setFilteredAccounts([...accounts]); 
  };

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
      const res = await axios.put(
        `http://localhost:4000/api/users/${id}/password`,
        { password: newPassword },
        { withCredentials: true }
      );
      setTimeout(async () => {
        await fetchAdmins();
      }, 1000);
      console.log("=== PASSWORD UPDATE RESPONSE ===");
      console.log("Status:", res);
      toast.success(`Account New Password successfully changed`);
      setSuperAdminAuth({ email: '', password: '' });
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
        email: superAdminAuth.email ? "provided" : "missing",
        password: superAdminAuth.password ? "provided" : "missing"
      });

      const currentAdmin = accounts.find(acc => acc._id === id) || archivedAccounts.find(acc => acc._id === id);
      console.log("Current admin in state:", currentAdmin);

      const requestData = {
        status: newStatus,
        reason: reason || ""
      };

      if (newStatus === 'deactivated' || newStatus === 'archived') {
        if (!superAdminAuth.email || !superAdminAuth.password) {
          toast.error("Super admin credentials are required");
          return;
        }
        requestData.superAdminEmail = superAdminAuth.email;
        requestData.superAdminPassword = superAdminAuth.password;
      }

      if (newStatus === 'active' && currentAdmin && currentAdmin.status === 'archived') {
        if (!superAdminAuth.email || !superAdminAuth.password) {
          toast.error("Super admin credentials are required to restore archived accounts");
          return;
        }
        requestData.superAdminEmail = superAdminAuth.email;
        requestData.superAdminPassword = superAdminAuth.password;
      }

      console.log("Request payload:", requestData);

      let response;
      let endpointUsed = "";
      
      try {
        endpointUsed = `http://localhost:4000/api/sa-admins/${id}/status`;
        console.log("Trying endpoint 1:", endpointUsed);
        response = await axios.put(endpointUsed, requestData);
      } catch (firstError) {
        console.log("First endpoint failed, trying alternative...");
        try {
          endpointUsed = `http://localhost:4000/api/admin/admin-status/${id}`;
          console.log("Trying endpoint 2:", endpointUsed);
          response = await axios.put(endpointUsed, requestData);
        } catch (secondError) {
          console.log("Second endpoint failed, trying third...");
          try {
            endpointUsed = `http://localhost:4000/api/sa-admins/status/${id}`;
            console.log("Trying endpoint 3:", endpointUsed);
            response = await axios.put(endpointUsed, requestData);
          } catch (thirdError) {
            endpointUsed = `http://localhost:4000/api/sa-admins/${id}`;
            console.log("Trying endpoint 4:", endpointUsed);
            response = await axios.put(endpointUsed, requestData);
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
      setSuperAdminAuth({ email: '', password: '' });
      
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
    
    if (!superAdminAuth.email || !superAdminAuth.password) {
      toast.error("Please provide super admin credentials");
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
    
    if (!superAdminAuth.email || !superAdminAuth.password) {
      toast.error("Please provide super admin credentials");
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
    
    if (!superAdminAuth.email || !superAdminAuth.password) {
      toast.error("Please provide super admin credentials");
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
    
    if (!superAdminAuth.email || !superAdminAuth.password) {
      toast.error("Please provide super admin credentials");
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
        password: '', 
      });
    } else {
      setEditId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
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
      await axios.post("http://localhost:4000/api/sa-admins", formData);
      toast.success("Admin added!");
      setFormPopupOpen(false);
      setShowAddConfirmPopup(false);
      fetchAdmins();
    } catch (err) {
      console.error("Error adding admin:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to add admin.");
      }
      setShowAddConfirmPopup(false);
    }
  };

  const confirmEdit = async () => {
    try {
      const { name, email } = formData;
      await axios.put(`http://localhost:4000/api/sa-admins/${editId}`, { name, email });
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
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = accounts.filter(account =>
      account.name.toLowerCase().includes(term.toLowerCase()) ||
      account.email.toLowerCase().includes(term.toLowerCase()) ||
      account.adminId.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAccounts(filtered);
  };

  const handleDownloadPDF = async () => {
    try {
      const tables = [
        {
          selector: '.order table:first-of-type',
          title: 'Active Admins'
        },
        {
          selector: '.order table:last-of-type',
          title: 'Archived Admins'
        }
      ];
      
      await generateMultiTablePDF(tables, 'admins-report', 'Admins Report');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
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
              <h3>Active Accounts</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <i className="bx bx-search"></i>
              </div>
              <i className="bx bx-sort" onClick={toggleSortOrder} title="Toggle Status Sort"></i>
              <i className="bx bx-reset" onClick={resetSorting} title="Reset to Default"></i>
              <i className="bx bx-plus" onClick={() => openForm()}></i>
            </div>
            <table ref={activeTableRef}>
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Admin ID</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>
                      <img src={profile} alt="Profile" />
                      <p>{account.name}</p>
                    </td>
                    <td>{account.adminId}</td>
                    <td>{account.email}</td>
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
                    <td>
                      <i
                        className="bx bx-pencil"
                        onClick={() => openForm(account)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="bx bx-archive"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowArchivePopup(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      <i
                        className="bx bx-lock-open"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowResetPopup(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order">
            <div className="head">
              <h3>Archived Accounts</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={archivedSearchTerm}
                  onChange={handleArchivedSearchChange}
                />
                <i className="bx bx-search"></i>
              </div>
            </div>
            <table ref={archivedTableRef}>
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Admin ID</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchivedAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>
                      <img src={profile} alt="Profile" />
                      <p>{account.name}</p>
                    </td>
                    <td>{account.adminId}</td>
                    <td>{account.email}</td>
                    <td>*************</td>
                    <td>{account.role}</td>
                    <td>{account.status}</td>
                    <td>
                      <i
                        className="bx bx-undo"
                        onClick={() => handleRestore(account)}
                        style={{ cursor: 'pointer' }}
                        title="Restore Account"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {formPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{editId ? "Edit Admin" : "Add Admin"}</h3>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
            {!editId && (
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" />
            )}
            <div className="popup-actions">
              <button onClick={() => setFormPopupOpen(false)}>Cancel</button>
              <button onClick={handleFormSubmit}>{editId ? "Update" : "Add"}</button>
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
                setSuperAdminAuth({ email: '', password: '' });
              }}>Cancel</button>
              <button className="deactivate" onClick={handleSuspend}>Deactivate</button>
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
              <button className="activate" onClick={handleActivate}>Activate</button>
            </div>
          </div>
        </div>
      )}

      {showArchivePopup && selectedAccount && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Archive {selectedAccount.name}?</h3>
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
                setShowArchivePopup(false);
                setSuperAdminAuth({ email: '', password: '' });
              }}>Cancel</button>
              <button className="archive" onClick={handleArchive}>Archive</button>
            </div>
          </div>
        </div>
      )}

      {showResetPopup && selectedAccount && (
        <div className="popup-overlay">
          <div className="popup-content">
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
                setShowResetPopup(false);
                setSuperAdminAuth({ email: '', password: '' });
              }}>Cancel</button>
              <button className="archive" onClick={handleReset}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {showRestorePopup && selectedAccount && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Restore {selectedAccount.name}?</h3>
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
                setShowRestorePopup(false);
                setSuperAdminAuth({ email: '', password: '' });
              }}>Cancel</button>
              <button className="activate" onClick={confirmRestore}>Restore</button>
            </div>
          </div>
        </div>
      )}

      {showAddConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Add</h3>
            <p>Are you sure you want to add <strong>{formData.name}</strong> as a new admin?</p>
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
            <p>Are you sure you want to update this admin's information?</p>
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