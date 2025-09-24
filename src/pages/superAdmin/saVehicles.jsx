import { useEffect, useState, useMemo } from 'react';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/Vehicles.css';
import profile from '../../assets/imgs/profile.png';
import { generateTablePDF } from '../../utils/pdfUtils';
import { useSelector } from 'react-redux';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({ bookingid:'',shippingline:'',name: '', rfid: '', vehicleType: '', category: '', status: 'active' });
  const [popupOpen, setPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState(null); 

  const [statusPopup, setStatusPopup] = useState({ open: false, vehicle: null });
  const [reason, setReason] = useState('');
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await get('/api/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load vehicles');
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortClick = () => setSortMode((prev) => (prev === null ? 0 : prev === 0 ? 1 : null));
  const resetSorting = () => setSortMode(null);

  const displayedVehicles = useMemo(() => {
    let list = [...vehicles];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (v) => v.name.toLowerCase().includes(term) || v.rfid.toLowerCase().includes(term)
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
  }, [vehicles, searchTerm, sortMode]);

  const openForm = (vehicle = null) => {
    if (vehicle && vehicle._id) {
      setEditId(vehicle._id);
      setFormData({
        bookingid: vehicle.bookingid,
        name: vehicle.name,
        rfid: vehicle.rfid,
        shippingline: vehicle.shippingline,
        vehicleType: vehicle.vehicleType,
        category: vehicle.category,
        status: vehicle.status,
      });
      setIsEditing(true);
    } else {
      setEditId(null);
      setFormData({ bookingid:'',shippingline:'',name: '', rfid: '', vehicleType: '', category: '', status: 'active' });
      setIsEditing(false);
    }
    setPopupOpen(true);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddOrUpdate = () => {
    if (editId) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    try {
      const res = await post('/api/vehicles', formData);
      setVehicles((prev) => [...prev, res.data]);
      AddAudit();
      toast.success('Vehicle added!');
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to add vehicle');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  const AddAudit = async (status = '', ids='' , vehiclestat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt ='';
    if (status === 'status') {
      actiontxt = 'Changed Status Vehicle: ' + ids + ' to ' + (vehiclestat == "Deactivated" ? 'Active' : 'Deactivated');
    }else{
      actiontxt = (isEditing ? 'Updated Vehicles: ' : 'Added Vehicles: ') + formData.name;
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
      const res = await put(`/api/vehicles/${editId}`, formData);
      setVehicles((prev) => prev.map((v) => (v._id === editId ? res.data : v)));
      AddAudit();
      toast.success('Vehicle updated!');
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to update vehicle');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', rfid: '', vehicleType: '', category: '', status: 'active' });
    setEditId(null);
    setPopupOpen(false);
    setIsEditing(false);
  };

  const handleStatusClick = (vehicle) => {
    setStatusPopup({ open: true, vehicle });
    if (vehicle.status === 'active') {
      setShowDeactivatePopup(true);
      setShowActivatePopup(false);
    } else {
      setShowActivatePopup(true);
      setShowDeactivatePopup(false);
    }
  };

  const updateStatus = async (id, newStatus, reasonText = '') => {
    try {
      const res = await put(`/api/vehicles/${id}`, { status: newStatus, reason: reasonText });
      setVehicles((prev) => prev.map((v) => (v._id === id ? res.data : v)));
      AddAudit('status',id,newStatus);
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Failed to update status');
    } finally {
      setStatusPopup({ open: false, vehicle: null });
      setReason('');
      setShowActivatePopup(false);
      setShowDeactivatePopup(false);
    }
  };

  const handleDownloadPDF = () => {
    generateTablePDF('.table-data table', 'vehicles-report', 'Vehicles Report');
  };

  return (
    <main className="vehicles">
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Vehicles</h1>
          <ul className="breadcrumb"><li><a href="#">Vehicles</a></li></ul>
        </div>
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>
      <div className="card-table">
        <div className="order">
          <div className="head">
            <h3>Vehicles</h3>
            <div className="search-container">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <i className="bx bx-search"></i>
            </div>
            <i className="bx bx-sort" onClick={handleSortClick} title="Sort by Status"></i>
            <i className="bx bx-reset" onClick={resetSorting} title="Reset to Default"></i>
            <i className="bx bx-plus" onClick={() => openForm()}></i>
          </div>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User ID</th>
                <th>Card Holder</th>
                <th>RFID</th>
                <th>Shipping Line</th>
                <th>Vehicle Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {displayedVehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <span>{v.bookingid}</span>
                  </td>
                   <td>
                    <span>{v.userId}</span>
                  </td>
                  <td>
                    <div className="avatar">
                      <div className="initial-avatar">
                        {v.name ? v.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    </div>
                    <span>{v.name}</span>
                  </td>
                  <td>{v.rfid}</td>
                  <td>{v.shippingline}</td>
                  <td>{v.vehicleType}</td>
                  <td>{v.category}</td>
                  <td>
                    <span
                      className={`status ${v.status}`}
                      onClick={() => handleStatusClick(v)}
                      style={{ cursor: 'pointer' }}
                    >{v.status}</span>
                  </td>
                  <td>
                    <i className="bx bx-pencil" onClick={() => openForm(v)} style={{ cursor: 'pointer' }}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <input type="text" name="bookingid" placeholder="Booking ID" value={formData.bookingid} onChange={handleInputChange} />
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} />
            <input type="text" name="rfid" placeholder="RFID" value={formData.rfid} onChange={handleInputChange} />
            <input type="text" name="shippingline" placeholder="Shipping Line" value={formData.shippingline} onChange={handleInputChange} />
            <input type="text" name="vehicleType" placeholder="Vehicle Type" value={formData.vehicleType} onChange={handleInputChange} />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} />
            <div className="popup-actions">
              <button onClick={() => setPopupOpen(false)}>Cancel</button>
              <button onClick={handleAddOrUpdate}>{isEditing ? 'Update' : 'Add'}</button>
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
            <p>Are you sure you want to update this vehicle?</p>
            <div className="popup-actions">
              <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
              <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}

      {showDeactivatePopup && statusPopup.open && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Deactivate {statusPopup.vehicle?.name}?</h3>
            <p>Reason for deactivation:</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select Reason</option>
              <option value="Lost RFID">Lost RFID</option>
              <option value="Violation">Violation</option>
              <option value="Expired">Expired</option>
              <option value="Other">Other</option>
            </select>
            <div className="popup-actions">
              <button onClick={() => setShowDeactivatePopup(false)}>Cancel</button>
              <button className="deactivate" onClick={() => updateStatus(statusPopup.vehicle._id, 'deactivated', reason)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {showActivatePopup && statusPopup.open && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Activate {statusPopup.vehicle?.name}?</h3>
            <p>Are you sure?</p>
            <div className="popup-actions">
              <button onClick={() => setShowActivatePopup(false)}>Cancel</button>
              <button className="activate" onClick={() => updateStatus(statusPopup.vehicle._id, 'active')}>Activate</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}