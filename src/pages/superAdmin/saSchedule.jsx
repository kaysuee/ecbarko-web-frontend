import { useEffect, useState, useMemo } from 'react';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/Schedules.css';
import { generateTablePDF } from '../../utils/pdfUtils'; 
import { useSelector, useDispatch } from 'react-redux';

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    date: '', 
    departureTime: '', 
    arrivalTime: '', 
    from: '', 
    to: '', 
    shippingLines: '',
    passengerCapacity: 200,
    passengerBooked: 0, 
    vehicleCapacity: 50,
    vehicleBooked: 0
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => { fetchSchedules(); }, []);
  const fetchSchedules = async () => {
    try {
      const res = await get('/api/schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch schedules');
    }
  };

  const handleSearchChange = e => setSearchTerm(e.target.value);
  const handleSortChange = e => setSortField(e.target.value || null);
  const resetSorting = () => { setSearchTerm(''); setSortField(null); };

  const displayedSchedules = useMemo(() => {
    let list = [...schedules];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.schedcde.toLowerCase().includes(term) ||
        s.date.toLowerCase().includes(term) ||
        s.departureTime.toLowerCase().includes(term) ||
        s.arrivalTime.toLowerCase().includes(term) ||
        s.from.toLowerCase().includes(term) ||
        s.to.toLowerCase().includes(term) ||
        s.shippingLines.toLowerCase().includes(term)
      );
    }
    if (sortField) {
      list.sort((a, b) => {
        const va = a[sortField] || '';
        const vb = b[sortField] || '';
        return va.localeCompare(vb);
      });
    }
    return list;
  }, [schedules, searchTerm, sortField]);

  const openForm = (item = null) => {
    if (item && item._id) {
      setEditId(item._id);
      setFormData({
        schedcde: item.schedcde,
        date: item.date,
        departureTime: item.departureTime,
        arrivalTime: item.arrivalTime,
        from: item.from,
        to: item.to,
        shippingLines: item.shippingLines,
        passengerCapacity: item.passengerCapacity || 200,
        passengerBooked: item.passengerBooked || 0,
        vehicleCapacity: item.vehicleCapacity || 50,
        vehicleBooked: item.vehicleBooked || 0
      });
      setIsEditing(true);
    } else {
      const newSchedCode = generateNextSchedCode(schedules);
      setEditId(null);
      setFormData({ 
        schedcde: newSchedCode, 
        date: '', 
        departureTime: '', 
        arrivalTime: '', 
        from: '', 
        to: '', 
        shippingLines: '',
        passengerCapacity: 200,
        passengerBooked: 0,
        vehicleCapacity: 50,
        vehicleBooked: 0
      });
      setIsEditing(false);
    }
    setPopupOpen(true);
  };

  const generateNextSchedCode = (scheduleList) => {
    const yearCode = String(new Date().getFullYear() % 100); // "25" for 2025
    let newSchedCode = `SCHED${yearCode}00001`;
  
    if (scheduleList && scheduleList.length > 0) {
      const last = [...scheduleList]
        .filter(s => s.schedcde && s.schedcde.startsWith(`SCHED${yearCode}`))
        .sort((a, b) => {
          const numA = parseInt(a.schedcde.replace(`SCHED${yearCode}`, ""));
          const numB = parseInt(b.schedcde.replace(`SCHED${yearCode}`, ""));
          return numB - numA;
        })[0];
  
      if (last) {
        const lastNum = parseInt(last.schedcde.replace(`SCHED${yearCode}`, ""));
        const nextNum = lastNum + 1;
        newSchedCode = `SCHED${yearCode}${String(nextNum).padStart(5, '0')}`;
      }
    }
  
    return newSchedCode;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    const processedValue = ['passengerCapacity', 'passengerBooked', 'vehicleCapacity', 'vehicleBooked'].includes(name)
      ? parseInt(value, 10) || 0
      : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleAddOrUpdate = () => {
    if (isEditing) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    try {
      const res = await post('/api/schedules', formData);
      setSchedules(prev => [...prev, res.data]);
      AddAudit();
      toast.success('Schedule added!');
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to save schedule');
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  const AddAudit = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    const action = (isEditing ? 'Updated Schedule: ' : 'Added Schedule: ') + formData.schedcde;
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
      const res = await put(`/api/schedules/${editId}`, formData);
      setSchedules(prev => prev.map(s => s._id === editId ? res.data : s));
      AddAudit();
      toast.success('Schedule updated!');
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to save schedule');
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      schedcde: '', 
      date: '', 
      departureTime: '', 
      arrivalTime: '', 
      from: '', 
      to: '', 
      shippingLines: '',
      passengerCapacity: 200,
      passengerBooked: 0,
      vehicleCapacity: 50,
      vehicleBooked: 0
    });
    setEditId(null);
    setPopupOpen(false);
    setIsEditing(false);
  };

  const handleDownloadPDF = () => {
    generateTablePDF('.table-data table', 'schedules-report', 'Schedules Report');
  };

  return (
    <main>
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Schedule</h1>
          <ul className="breadcrumb"><li><a href="#">Schedule</a></li></ul>
        </div>
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Schedules</h3>
            <div className="search-container">
            <input
              type="text"
              placeholder="Search schedules..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <i className="bx bx-search"></i>
            </div>
            <div className="sort-container">
              <select className="sort-select" value={sortField || ''} onChange={handleSortChange}>
                <option value="">Sort By</option>
                <option value="date">Date</option>
                <option value="departureTime">Departure Time</option>
                <option value="arrivalTime">Arrival Time</option>
                <option value="from">From</option>
                <option value="to">To</option>
                <option value="shippingLines">Shipping Lines</option>
              </select>
            </div>
            <i className="bx bx-reset" onClick={resetSorting} title="Reset Filters and Sort"></i>
            <i className="bx bx-plus" onClick={() => openForm()}></i>
          </div>

          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Date</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>From</th>
                <th>To</th>
                <th>Shipping Lines</th>
                <th>Passenger Seats</th>
                <th>Vehicle Slots</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedSchedules.map(s => (
                <tr key={s._id}>
                  <td>{s.schedcde}</td>
                  <td>{s.date}</td>
                  <td>{s.departureTime}</td>
                  <td>{s.arrivalTime}</td>
                  <td>{s.from}</td>
                  <td>{s.to}</td>
                  <td>{s.shippingLines}</td>
                  <td>
                    <div className="capacity-display">
                      <span className="capacity-text">
                        {((s.passengerCapacity || 200) - (s.passengerBooked || 0))} left
                      </span>
                      <div className="capacity-bar">
                        <div 
                          className="capacity-progress" 
                          style={{ 
                            width: `${Math.min(100, ((s.passengerBooked || 0) / (s.passengerCapacity || 200) * 100))}%`,
                            backgroundColor: ((s.passengerBooked || 0) / (s.passengerCapacity || 200) > 0.8) ? '#e74c3c' : '#3498db'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="capacity-display">
                      <span className="capacity-text">
                        {((s.vehicleCapacity || 50) - (s.vehicleBooked || 0))} left
                      </span>
                      <div className="capacity-bar">
                        <div 
                          className="capacity-progress" 
                          style={{ 
                            width: `${Math.min(100, ((s.vehicleBooked || 0) / (s.vehicleCapacity || 50) * 100))}%`,
                            backgroundColor: ((s.vehicleBooked || 0) / (s.vehicleCapacity || 50) > 0.8) ? '#e74c3c' : '#3498db'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <i
                      className="bx bx-pencil"
                      onClick={() => openForm(s)}
                      style={{ cursor: 'pointer' }}
                    ></i>
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
            <h3>{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h3>
            <input type="text" name="schedcde" placeholder="" value={formData.schedcde} onChange={handleInputChange} readOnly/>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required/>
            <input type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} required/>
            <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} required />
            <input type="text" name="from" placeholder="Enter Departure Location" value={formData.from} onChange={handleInputChange} />
            <input type="text" name="to" placeholder="Enter Destination" value={formData.to} onChange={handleInputChange} />
            <input type="text" name="shippingLines" placeholder="Enter Shipping Lines" value={formData.shippingLines} onChange={handleInputChange} />
            
            <div className="sched-capacity-inputs">
              <div className="sched-capacity-input-group">
                <label>Passenger Capacity</label>
                <input 
                  type="number" 
                  name="passengerCapacity" 
                  placeholder="Total Passenger Capacity" 
                  value={formData.passengerCapacity} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="sched-capacity-input-group">
                <label>Passengers Booked</label>
                <input 
                  type="number" 
                  name="passengerBooked" 
                  placeholder="Passengers Booked" 
                  value={formData.passengerBooked} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="sched-capacity-inputs">
              <div className="sched-capacity-input-group">
                <label>Vehicle Capacity</label>
                <input 
                  type="number" 
                  name="vehicleCapacity" 
                  placeholder="Total Vehicle Capacity" 
                  value={formData.vehicleCapacity} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="sched-capacity-input-group">
                <label>Vehicles Booked</label>
                <input 
                  type="number" 
                  name="vehicleBooked" 
                  placeholder="Vehicles Booked" 
                  value={formData.vehicleBooked} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="sched-popup-actions">
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
            <p>Are you sure you want to add <strong>{formData.date}</strong> schedule?</p>
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
            <p>Are you sure you want to update this schedule?</p>
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