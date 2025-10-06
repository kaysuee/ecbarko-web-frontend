import React, { useState, useEffect, useMemo } from 'react';
import { getPassengerFares, addPassengerFare, updatePassengerFare } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/FareCategories.css';
import '../../styles/table-compression.css'; 
import { generateFareCategoriesPDF } from '../../utils/pdfUtils';

const initialForm = {
  _id: '',
  passengerType: '',
  category: '',
  type: '',
  description: '',
  price: '',
  ageRange: '',
  minAge: '',
  maxAge: '',
  discount: '',
  discountPercentage: '',
  requirements: '',
  isActive: true,
  route: 'default'
};

export default function SaFare() {
  const [fares, setFares] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    setLoading(true);
    try {
      const res = await getPassengerFares();
      setFares(res.data);
    } catch (err) {
      toast.error('Failed to fetch passenger fares');
    }
    setLoading(false);
  };

  const handleSearchChange = e => setSearchTerm(e.target.value);
  const handleSortChange = e => setSortField(e.target.value || null);
  const resetSorting = () => { setSearchTerm(''); setSortField(null); };

  const displayedFares = useMemo(() => {
    let list = [...fares];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(f => 
        f.name?.toLowerCase().includes(term) ||
        f.displayName?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.ageRange?.toLowerCase().includes(term)
      );
    }
    if (sortField) {
      if (sortField === 'latest') {
        list.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
      } else if (sortField === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
      } else {
        list.sort((a, b) => {
          const va = a[sortField] || '';
          const vb = b[sortField] || '';
          if (typeof va === 'number' && typeof vb === 'number') {
            return va - vb;
          }
          return va.toString().localeCompare(vb.toString());
        });
      }
    }
    return list;
  }, [fares, searchTerm, sortField]);

  const openForm = (fare = null) => {
    if (fare && fare._id) {
      setForm({ ...fare });
      setEditingId(fare._id);
      setIsEditing(true);
    } else {
      setForm(initialForm);
      setEditingId(null);
      setIsEditing(false);
    }
    setPopupOpen(true);
    setError('');
  };

  const closePopup = () => {
    setPopupOpen(false);
    setForm(initialForm);
    setEditingId(null);
    setIsEditing(false);
    setError('');
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddOrUpdate = () => {
    if (isEditing) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    setLoading(true);
    setError('');
    try {
      // Generate required fields based on form data
      const passengerType = form.type.toLowerCase().replace(/\s+/g, '_').replace(/_fare$/, '');
      const fareData = {
        ...form,
        _id: `${passengerType}_fare`,
        passengerType: passengerType,
        category: passengerType
      };
      
      const res = await addPassengerFare(fareData);
      setFares(prev => [...prev, res.data]);
      toast.success('Passenger fare added!');
      closePopup();
    } catch (err) {
      setError('Failed to save passenger fare');
      toast.error('Failed to save passenger fare');
    }
    setLoading(false);
    setShowAddConfirmPopup(false);
  };

  const confirmEdit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await updatePassengerFare(editingId, form);
      setFares(prev => prev.map(f => f._id === editingId ? res.data : f));
      toast.success('Passenger fare updated!');
      closePopup();
    } catch (err) {
      setError('Failed to save passenger fare');
      toast.error('Failed to save passenger fare');
    }
    setLoading(false);
    setShowEditConfirmPopup(false);
  };

  const handleDownloadPDF = () => {
    generateFareCategoriesPDF(displayedFares, 'fare-categories-report');
  };

  return (
    <div className="fares">
      <main>
        <Toaster position="top-center" />
        <div className="head-title">
          <div className="left">
            <h1>Rates</h1>
            <ul className="breadcrumb">
              <li><a>Rates</a></li>
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
              <h3>Rates</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search rates..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <i className="bx bx-search"></i>
              </div>
              {/* <div className="sort-container">
                <select className="sort-select" value={sortField || ''} onChange={handleSortChange}>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="_id">ID</option>
                  <option value="passengerType">Passenger Type</option>
                  <option value="category">Category</option>
                  <option value="type">Type</option>
                  <option value="price">Price</option>
                  <option value="ageRange">Age Range</option>
                  <option value="minAge">Min Age</option>
                  <option value="maxAge">Max Age</option>
                  <option value="discount">Discount</option>
                  <option value="discountPercentage">Discount %</option>
                  <option value="requirements">Requirements</option>
                  <option value="isActive">Active</option>
                  <option value="route">Route</option>
                </select>
              </div> */}
              <i 
                className="bx bx-reset" 
                onClick={fetchFares} 
                title="Reload Fares"
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              ></i>
              <i className="bx bx-plus" onClick={() => openForm()}></i>
            </div>

            <div className="table-container">
              <table className="compressed-table">
                <thead>
                  <tr>
                    {/* <th>ID</th> */}
                    {/* <th>Passenger Type</th> */}
                    {/* <th>Category</th> */}
                    <th>Type</th>
                    <th>Description</th>
                    <th>Price (₱)</th>
                    <th>Age Range</th>
                    {/* <th>Min Age</th>
                    <th>Max Age</th> */}
                    <th>Discount (₱)</th>
                  <th>Discount %</th>
                  <th>Requirements</th>
                  {/* <th>Active</th> */}
                  {/* <th>Route</th> */}
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {displayedFares.map(fare => (
                  <tr key={fare._id}>
                    {/* <td>{fare._id}</td> */}
                    {/* <td>{fare.passengerType}</td>
                    <td>{fare.category}</td> */}
                    <td>{fare.type}</td>
                    <td>{fare.description}</td>
                    <td>₱{fare.price}</td>
                    <td>{fare.ageRange}</td>
                    {/* <td>{fare.minAge}</td>
                    <td>{fare.maxAge ?? '-'}</td> */}
                    <td>₱{fare.discount ?? 0}</td>
                    <td>{fare.discountPercentage ?? '-'}</td>
                    <td>{fare.requirements ?? '-'}</td>
                    {/* <td>
                      <span className={`status ${fare.isActive ? 'active' : 'inactive'}`}>
                        {fare.isActive ? 'Yes' : 'No'}
                      </span>
                    </td> */}
                    {/* <td>{fare.route}</td> */}
                    <td>
                      <i
                        className="bx bx-edit"
                        onClick={() => openForm(fare)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Popup for Add/Edit */}
        {popupOpen && (
         <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setPopupOpen(false); }}>
            <div className="popup-content">
              <h3>{isEditing ? 'Edit Passenger Fare' : 'Add Passenger Fare'}</h3>
              {error && <div className="error" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

              {/* <input name="_id" value={form._id} onChange={handleChange} placeholder="ID (e.g. adult_fare)" required /> */}
              {/* <input name="passengerType" value={form.passengerType} onChange={handleChange} placeholder="Passenger Type (e.g. adult)" required />
              <input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g. adult)" required /> */}
              <input name="type" value={form.type} onChange={handleChange} placeholder="Type (e.g. Regular Fare)" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required />
              <input name="ageRange" value={form.ageRange} onChange={handleChange} placeholder="Age Range (e.g. 18-59 years)" />
              {/* <input name="minAge" type="number" value={form.minAge} onChange={handleChange} placeholder="Min Age" />
              <input name="maxAge" type="number" value={form.maxAge || ''} onChange={handleChange} placeholder="Max Age (blank for none)" /> */}
              <input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="Discount" />
              <input name="discountPercentage" type="number" value={form.discountPercentage || ''} onChange={handleChange} placeholder="Discount % (blank for none)" />
              <input name="requirements" value={form.requirements || ''} onChange={handleChange} placeholder="Requirements (blank for none)" />
              <input name="route" value={form.route} onChange={handleChange} placeholder="Route (default)" />
              <label className="fare-checkbox-container"> 
                <input 
                  name="isActive" 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={handleChange}
                />  
                <span>Active</span>
              </label>

              <div className="sched-popup-actions">
                <button onClick={closePopup}>Cancel</button>
                <button onClick={handleAddOrUpdate} disabled={loading}>
                  {isEditing ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Add */}
        {showAddConfirmPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Confirm Add</h3>
              <p>Are you sure you want to add <strong>{form.type}</strong> rates?</p>
              <div className="popup-actions">
                <button onClick={() => setShowAddConfirmPopup(false)}>Cancel</button>
                <button onClick={confirmAdd}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Edit */}
        {showEditConfirmPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Confirm Update</h3>
              <p>Are you sure you want to update this rates?</p>
              <div className="popup-actions">
                <button onClick={() => setShowEditConfirmPopup(false)}>Cancel</button>
                <button className="confirm" onClick={confirmEdit}>Yes, Update</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
