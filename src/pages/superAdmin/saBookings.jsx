import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/Booking.css';
import { generateTablePDF } from '../../utils/pdfUtils';
import { useSelector } from 'react-redux';
import { post,get, put } from '../../services/ApiEndpoint';
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({ 
    bookingId: '', 
    departureLocation: '', 
    arrivalLocation: '', 
    departDate: '', 
    departTime: '', 
    passengers: 1, 
    hasVehicle: false,
    vehicleType: '',
    shippingLine: '',
    userId: '',
    payment: '',
    status: 'active' 
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState(null); 

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const response = await get('/api/eticket');
      setBookings(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load bookings');
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortClick = () => setSortMode((prev) => (prev === null ? 0 : prev === 0 ? 1 : null));
  const resetSorting = () => setSortMode(null);

  const displayedBookings = useMemo(() => {
    let list = [...bookings];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (b) => b.bookingReference.toLowerCase().includes(term) || 
               b.departureLocation.toLowerCase().includes(term) ||
               b.arrivalLocation.toLowerCase().includes(term) 
      );
    }
    if (sortMode !== null) {
      list.sort((a, b) => {
        const rankA = sortMode === 0 ? (a.status === 'active' ? 0 : 1) : (a.status === 'cancelled' ? 0 : 1);
        const rankB = sortMode === 0 ? (b.status === 'active' ? 0 : 1) : (b.status === 'cancelled' ? 0 : 1);
        return rankA - rankB;
      });
    }
    return list;
  }, [bookings, searchTerm, sortMode]);

  const openForm = (booking = null) => {
    if (booking && booking._id) {
      setEditId(booking._id);
      const formattedDate = booking.departDate ? new Date(booking.departDate).toISOString().split('T')[0] : '';
      setFormData({
        bookingId: booking.bookingReference,
        departureLocation: booking.departureLocation,
        arrivalLocation: booking.arrivalLocation,
        departDate: formattedDate,
        departTime: convertTo24Hour(booking.departTime),
        passengers: booking.passengers,
        hasVehicle: booking.hasVehicle,
        vehicleType: extractType(booking.selectedCardType) || '',
        shippingLine: booking.shippingLine,
        userId: booking.userID,
        payment: booking.totalFare,
        status: booking.status,
      });
      setIsEditing(true);
    } else {
      setEditId(null);
      setFormData({ 
        bookingId: '', 
        departureLocation: '', 
        arrivalLocation: '', 
        departDate: '', 
        departTime: '', 
        passengers: 1, 
        hasVehicle: false,
        vehicleType: '',
        shippingLine: '',

        userId: '',
        payment: '',
        status: 'active' 
      });
      setIsEditing(false);
    }
    setPopupOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value 
    });
  };

  const handleAddOrUpdate = () => {
    const requiredFields = [
      'bookingId', 'departureLocation', 'arrivalLocation', 
      'departDate', 'departTime', 'shippingLine', 
      'userId', 'payment'
    ];

    if (formData.hasVehicle) {
      requiredFields.push('vehicleType');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (editId) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    try {
      const res = await axios.post('/api/bookings', formData, { withCredentials: true });
      setBookings((prev) => [...prev, res.data]);
      AddAudit();
      toast.success('Booking added!');
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to add booking');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  const AddAudit = async (status = '', ids='' , bookingstat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt ='';
    if (status === 'status') {
      actiontxt = 'Changed Status Bookings: ' + ids + ' to ' + (bookingstat == "Active" ? 'Cancelled' : 'Active');
    }else{
      actiontxt = (isEditing ? 'Updated Bookings: ' : 'Added Bookings: ') + formData.bookingId;
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
      const res = await axios.put(`/api/bookings/${editId}`, formData, { withCredentials: true });
      setBookings((prev) => prev.map((b) => (b._id === editId ? res.data : b)));
      AddAudit();
      toast.success('Booking updated!');
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to update booking');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      bookingId: '', 
      departureLocation: '', 
      arrivalLocation: '', 
      departDate: '', 
      departTime: '', 
      passengers: 1, 
      hasVehicle: false,
      vehicleType: '',
      shippingLine: '',
      departurePort: '',
      arrivalPort: '',
      userId: '',
      payment: '',
      status: 'active' 
    });
    setEditId(null);
    setPopupOpen(false);
    setIsEditing(false);
  };

  const extractType = (cardType) => {
    // Extract "Type X" from "Type X (other text)"
    const match = cardType.match(/^Type \d+/);
    return match ? match[0] : '';
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleStatusClick = async (booking) => {
    const newStatus = booking.status === 'active' ? 'cancelled' : 'active';
    try {
      const res = await put(
        `/api/eticket/${booking._id}`, 
        { status: newStatus }
      );
      console.log('Status updated:', res.data);
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? res.data : b)));
      AddAudit('status', booking.bookingReference, booking.status);
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPDF = () => {
    generateTablePDF('.table-data table', 'bookings-report', 'Bookings Report');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <main className="bookings">
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Bookings</h1>
          <ul className="breadcrumb"><li><a href="#">Bookings</a></li></ul>
        </div>
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>
      <div className="card-table">
        <div className="order">
          <div className="head">
            <h3>Bookings</h3>
            <div className="search-container">
            <input
              type="text"
              placeholder="Search bookings..."
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
                <th>Route</th>
                <th>Date & Time</th>
                <th>Passengers</th>
                <th>Vehicle</th>
                <th>Vehicle Type</th>
                <th>Shipping Line</th>
                <th>User ID</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingReference}</td>
                  <td>{b.departureLocation} → {b.arrivalLocation}</td>
                  <td>{formatDate(b.departDate)} {b.departTime}</td>
                  <td>
                  <ul style={{ paddingLeft: '1em', margin: 0 }}>
                    {b.passengers.map((p, idx) => (
                      <li key={idx}>
                        {p.name} ({p.contact})
                      </li>
                    ))}
                  </ul>
                </td>
                  <td>{b.hasVehicle ? 'Yes' : 'No'}</td>
                  <td>{b.hasVehicle ? b.selectedCardType : 'N/A'}</td>
                  <td>{b.shippingLine}</td>
                  <td>{b.userID}</td> 
                  <td>₱{b.totalFare}</td>
                  <td>
                    <span
                      className={`status ${b.status}`}
                      onClick={() => handleStatusClick(b)}
                      style={{ cursor: 'pointer' }}
                    >{b.status}</span>
                  </td>
                  <td>
                    <i className="bx bx-pencil" onClick={() => openForm(b)} style={{ cursor: 'pointer' }}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content booking-form">
            <h3>{isEditing ? 'Edit Booking' : 'Add New Booking'}</h3>
            <div className="form-row">
              <input 
                type="text" 
                name="bookingId" 
                placeholder="Booking ID *" 
                value={formData.bookingId} 
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                name="userId" 
                placeholder="User ID *" 
                value={formData.userId} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input 
                type="text" 
                name="departureLocation" 
                placeholder="Departure Location *" 
                value={formData.departureLocation} 
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                name="arrivalLocation" 
                placeholder="Arrival Location *" 
                value={formData.arrivalLocation} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input 
                type="date" 
                name="departDate" 
                placeholder="Departure Date *" 
                value={formData.departDate} 
                onChange={handleInputChange}
                required
              />
              <input 
                type="time" 
                name="departTime" 
                placeholder="Departure Time *" 
                value={formData.departTime} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input 
                type="number" 
                name="passengers" 
                placeholder="Number of Passengers *" 
                value={formData.passengers.length} 
                onChange={handleInputChange} 
                min="1"
                required
              />
              <input 
                type="text" 
                name="payment" 
                placeholder="Payment Amount *" 
                value={formData.payment} 
                onChange={handleInputChange}
                required
              />
            </div>
            <input 
              type="text" 
              name="shippingLine" 
              placeholder="Shipping Line *" 
              value={formData.shippingLine} 
              onChange={handleInputChange}
              required
            />
            {/* <div className="form-row">
              <input 
                type="text" 
                name="departurePort" 
                placeholder="Departure Port *" 
                value={formData.departurePort} 
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                name="arrivalPort" 
                placeholder="Arrival Port *" 
                value={formData.arrivalPort} 
                onChange={handleInputChange}
                required
              />
            </div> */}
            <div className="checkbox-container">
              <label>
                <input 
                  type="checkbox" 
                  name="hasVehicle" 
                  checked={formData.hasVehicle} 
                  onChange={handleInputChange} 
                />
                Has Vehicle
              </label>
            </div>
            {formData.hasVehicle && (
              <div className="vehicle-type-section">
                <label htmlFor="vehicleType">Vehicle Type *</label>
                <select 
                  name="vehicleType" 
                  value={formData.vehicleType} 
                  onChange={handleInputChange}
                  required={formData.hasVehicle}
                  id="vehicleType"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Type 1">Type 1</option>
                  <option value="Type 2">Type 2</option>
                  <option value="Type 3">Type 3</option>
                  <option value="Type 4">Type 4</option>
                  <option value="Type 5">Type 5</option>
                  <option value="Type 6">Type 6</option>
                  <option value="Type 7">Type 7</option>
                </select>
              </div>
            )}
            <div className="popup-actions">
              <button onClick={() => setPopupOpen(false)}>Cancel</button>
              <button onClick={handleAddOrUpdate}>{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Add Popup */}
      {showAddConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Add</h3>
            <p>Are you sure you want to add booking <strong>{formData.bookingId}</strong>?</p>
            <div className="popup-actions">
              <button onClick={() => setShowAddConfirmPopup(false)}>Cancel</button>
              <button onClick={confirmAdd}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Edit Popup */}
      {showEditConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update this booking?</p>
            <div className="popup-actions">
              <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
              <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}