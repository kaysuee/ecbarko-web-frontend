import { useEffect, useState, useMemo } from 'react';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/Vehicles.css';
import '../../styles/table-compression.css';
import { generateVehiclesPDF } from '../../utils/pdfUtils';
import { useSelector } from 'react-redux';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [formData, setFormData] = useState({ 
    cardNumber: '', 
    vehicleName: '', 
    plateNumber: '', 
    status: 'active' 
  });
  const [multipleVehicles, setMultipleVehicles] = useState([
    { vehicleName: '', plateNumber: '' }
  ]);
  const [cardInfo, setCardInfo] = useState(null);
  const [cardVehicles, setCardVehicles] = useState([]); 
  const [popupOpen, setPopupOpen] = useState(false);
  const [editMode, setEditMode] = useState('multiple'); 
  const [formIntent, setFormIntent] = useState('add'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');
  const [loading, setLoading] = useState(false);

  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showUnregisterConfirmPopup, setShowUnregisterConfirmPopup] = useState(false);
  const [vehicleToUnregister, setVehicleToUnregister] = useState(null);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => { 
    fetchVehicles(); 
    fetchVehicleCategories();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await get('/api/vehicles');
      console.log('Fetched vehicles:', res.data); 
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleCategories = async () => {
    try {
      const res = await get('/api/vehicles/categories');
      setVehicleCategories(res.data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      toast.error('Failed to load vehicle categories');
    }
  };

  const fetchCardVehicles = async (cardNumber) => {
    try {
      const res = await get(`/api/vehicles/card/${cardNumber}`);
      setCardVehicles(res.data);
    } catch (err) {
      console.error('Fetch card vehicles error:', err);
      setCardVehicles([]);
    }
  };

  const validateCard = async (cardNumber) => {
    if (!cardNumber || cardNumber.length < 4) {
      setCardInfo(null);
      setCardVehicles([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await get(`/api/vehicles/validate-card/${cardNumber}`);
      setCardInfo(res.data);
      await fetchCardVehicles(cardNumber);
      if (!res.data.canRegisterMore) {
        toast.error('Maximum 5 vehicles allowed per card');
      }
    } catch (err) {
      setCardInfo(null);
      setCardVehicles([]);
      toast.error('Card not found or inactive');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (cardNumber) => {
    setExpandedCards(prev => {
      const newSet = new Set();
      // Only add the clicked card if it wasn't already expanded (auto-close behavior)
      if (!prev.has(cardNumber)) {
        newSet.add(cardNumber);
      }
      return newSet;
    });
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSortChange = (e) => setSortField(e.target.value);

  const displayedVehicles = useMemo(() => {
    let list = [...vehicles];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (v) => 
          v.vehicleName?.toLowerCase().includes(term) || 
          v.plateNumber?.toLowerCase().includes(term) ||
          v.cardNumber?.toLowerCase().includes(term) ||
          v.userId?.toLowerCase().includes(term) ||
          v.userName?.toLowerCase().includes(term)
      );
    }
    if (sortField) {
      if (sortField === 'latest') {
        list.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
      } else if (sortField === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
      } else {
        list.sort((a, b) => {
          if (sortField === 'cardNumber') return a.cardNumber.localeCompare(b.cardNumber);
          if (sortField === 'vehicleName') return a.vehicleName.localeCompare(b.vehicleName);
          if (sortField === 'plateNumber') return (a.plateNumber || '').localeCompare(b.plateNumber || '');
          if (sortField === 'userName') return a.userName.localeCompare(b.userName);
          if (sortField === 'vehicleType') return a.vehicleType.localeCompare(b.vehicleType);
          if (sortField === 'registeredBy') return a.registeredBy.localeCompare(b.registeredBy);
          return 0;
        });
      }
    }
    return list;
  }, [vehicles, searchTerm, sortField]);

  const groupedVehicles = useMemo(() => {
    const groups = {};
    displayedVehicles.forEach(vehicle => {
      const cardNumber = vehicle.cardNumber;
      if (!groups[cardNumber]) {
        groups[cardNumber] = {
          cardNumber: vehicle.cardNumber,
          userId: vehicle.userId,
          userName: vehicle.userName,
          registeredBy: vehicle.registeredBy,
          createdAt: vehicle.createdAt,
          vehicles: []
        };
      }
      groups[cardNumber].vehicles.push(vehicle);
    });
    return Object.values(groups);
  }, [displayedVehicles]);

  const openForm = (vehicle = null, mode = 'multiple', intent = 'add') => {
    setEditMode(mode);
    setFormIntent(intent);
    
    if (vehicle && intent === 'manage') {
      setFormData({
        cardNumber: vehicle.cardNumber,
        vehicleName: '', 
        plateNumber: '', 
        status: 'active'
      });
      validateCard(vehicle.cardNumber);
      fetchCardVehicles(vehicle.cardNumber); 
    } else {
      if (intent === 'add' && vehicle) {
        setFormData({ 
          cardNumber: vehicle.cardNumber, 
          vehicleName: '', 
          plateNumber: '', 
          status: 'active' 
        });
        validateCard(vehicle.cardNumber);
      } else {
        setFormData({ 
          cardNumber: '', 
          vehicleName: '', 
          plateNumber: '', 
          status: 'active' 
        });
        setCardInfo(null);
        setCardVehicles([]);
      }
      setMultipleVehicles([{ vehicleName: '', plateNumber: '' }]);
    }
    setPopupOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'cardNumber') {
      validateCard(value);
      if (value.length >= 4) {
        fetchCardVehicles(value);
      }
    }
  };

  const handleMultipleVehicleChange = (index, field, value) => {
    setMultipleVehicles(prev => 
      prev.map((vehicle, i) => {
        if (i === index) {
          const updatedVehicle = { ...vehicle, [field]: value };
          
          if (field === 'vehicleName' && ['Bicycle', 'Bicycle with Sidecar'].includes(value)) {
            updatedVehicle.plateNumber = '';
          }
          
          return updatedVehicle;
        }
        return vehicle;
      })
    );
  };

  const addVehicleRow = () => {
    if (multipleVehicles.length < 5) {
      setMultipleVehicles(prev => [...prev, { vehicleName: '', plateNumber: '' }]);
    } else {
      toast.error('Maximum 5 vehicles can be registered at once');
    }
  };

  const removeVehicleRow = (index) => {
    if (multipleVehicles.length > 1) {
      setMultipleVehicles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleUnregisterVehicle = (vehicle) => {
    console.log('Vehicle to unregister:', vehicle);
    console.log('Vehicle ID:', vehicle._id);
    console.log('Vehicle object keys:', Object.keys(vehicle));
    setVehicleToUnregister(vehicle);
    setShowUnregisterConfirmPopup(true);
  };

  const confirmUnregister = async () => {
    if (!vehicleToUnregister) return;
    
    setLoading(true);
    try {
      console.log('Attempting to unregister vehicle:', vehicleToUnregister._id);
      const response = await fetch(`/api/vehicles/${vehicleToUnregister._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        
        setVehicles(prev => prev.filter(v => v._id !== vehicleToUnregister._id));
        setCardVehicles(prev => prev.filter(v => v._id !== vehicleToUnregister._id));
        AddAudit('unregister', vehicleToUnregister.plateNumber || vehicleToUnregister.vehicleName);
        toast.success('Vehicle unregistered successfully!');
        fetchVehicles();
        if (formData.cardNumber) {
          fetchCardVehicles(formData.cardNumber);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Unregister failed with status:', response.status, 'Error:', errorData);
        throw new Error(`Failed to unregister vehicle: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Unregister error:', err);
      toast.error(`Failed to unregister vehicle: ${err.message}`);
    } finally {
      setLoading(false);
      setShowUnregisterConfirmPopup(false);
      setVehicleToUnregister(null);
    }
  };

  const handleAddOrUpdate = () => {
    if (!formData.cardNumber) {
      toast.error('Please enter card number');
      return;
    }
    
    if (!cardInfo) {
      toast.error('Please enter a valid card number');
      return;
    }
    
    const validVehicles = multipleVehicles.filter(v => {
      const hasVehicleName = v.vehicleName && v.vehicleName.trim();
      const isBicycle = ['Bicycle', 'Bicycle with Sidecar'].includes(v.vehicleName);
      const hasPlateNumber = v.plateNumber && v.plateNumber.trim();
      
      return hasVehicleName && (isBicycle || hasPlateNumber);
    });
    if (validVehicles.length === 0) {
      toast.error('Please fill in at least one complete vehicle with name and plate number');
      return;
    }

      const remainingSlots = 5 - (cardInfo?.vehicleCount || 0);
      if (validVehicles.length > remainingSlots) {
        toast.error(`Only ${remainingSlots} more vehicles can be registered to this card`);
        return;
      }

      setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    setLoading(true);
    try {
      const validVehicles = multipleVehicles.filter(v => {
        const hasVehicleName = v.vehicleName && v.vehicleName.trim();
        const isBicycle = ['Bicycle', 'Bicycle with Sidecar'].includes(v.vehicleName);
        const hasPlateNumber = v.plateNumber && v.plateNumber.trim();
        
        return hasVehicleName && (isBicycle || hasPlateNumber);
      });
      
      console.log('All vehicles:', multipleVehicles);
      console.log('Valid vehicles:', validVehicles);
      
      if (validVehicles.length === 0) {
        toast.error('Please fill in at least one complete vehicle');
        setLoading(false);
        setShowAddConfirmPopup(false);
        return;
      }
      
      const vehiclesData = validVehicles.map(v => ({
        vehicleName: v.vehicleName,
        plateNumber: ['Bicycle', 'Bicycle with Sidecar'].includes(v.vehicleName) ? null : v.plateNumber
      }));

      const bulkRegistrationData = {
        cardNumber: formData.cardNumber,
        vehicles: vehiclesData,
        registeredBy: user.name || user.adminId
      };

      console.log('Sending bulk registration data:', bulkRegistrationData);

      const response = await post('/api/vehicles/bulk', bulkRegistrationData);
      const { vehicles: newVehicles, groupInfo } = response.data;
      
      await fetchVehicles();
      
      AddAudit('register_multiple_group', `${validVehicles.length} vehicles as group`);
      
      toast.success(
        `${validVehicles.length} vehicles registered successfully as a group! ` +
        `Card ${groupInfo.cardNumber} now has ${groupInfo.totalVehiclesInGroup} vehicles.`
      );
      
      resetForm();
    } catch (err) {
      console.error('Add error:', err);
      toast.error(err.response?.data?.error || 'Failed to register vehicle(s)');
    } finally {
      setLoading(false);
      setShowAddConfirmPopup(false);
    }
  };

  const AddAudit = async (status = '', ids = '', vehiclestat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const name = user.name || 'Unknown User';
    const userID = user.adminId || 'Unknown User ID';
    let actiontxt = '';
    if (status === 'status') {
      actiontxt = 'Changed Status Vehicle: ' + ids + ' to ' + (vehiclestat == "Deactivated" ? 'Active' : 'Deactivated');
    } else if (status === 'register_multiple') {
      actiontxt = `Registered ${ids} to card ${formData.cardNumber}`;
    } else if (status === 'register_multiple_group') {
      actiontxt = `Registered ${ids} as a group to card ${formData.cardNumber}`;
    } else {
      actiontxt = 'Registered Vehicle: ' + formData.plateNumber;
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

  const resetForm = () => {
    setFormData({ 
      cardNumber: '', 
      vehicleName: '', 
      plateNumber: '', 
      status: 'active' 
    });
    setMultipleVehicles([{ vehicleName: '', plateNumber: '' }]);
    setCardInfo(null);
    setCardVehicles([]);
    setEditMode('multiple');
    setFormIntent('add');
    setPopupOpen(false);
  };

  const handleDownloadPDF = () => {
    const data = groupedVehicles.map((group) => ({
      cardNumber: group.cardNumber,
      userId: group.userId,
      userName: group.userName,
      vehicleCount: `${group.vehicles.length} vehicle${group.vehicles.length !== 1 ? 's' : ''}`,
      vehicleDetails: group.vehicles.map(v => 
        `${v.vehicleName} ${v.plateNumber ? `(${v.plateNumber})` : '(Bicycle)'}`
      ).join('; '),
      registeredBy: group.registeredBy,
      createdAt: group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    generateVehiclesPDF(data);
  };

  return (
    <main className="vehicles" style={{ paddingTop: '10px', marginTop: '0' }}>
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Vehicle Registration</h1>
          <ul className="breadcrumb">
            <li><a href="#">Vehicle Registration</a></li>
          </ul>
        </div>
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>

      <div className="card-table">
        <div className="order">
          <div className="head">
            <h3>Registered Vehicles</h3>
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
            {/* Sort dropdown */}
            <select className="sort-select" value={sortField} onChange={handleSortChange}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="cardNumber">Card Number</option>
              <option value="vehicleName">Vehicle Name</option>
              <option value="plateNumber">Plate Number</option>
              <option value="userName">User Name</option>
              <option value="vehicleType">Vehicle Type</option>
              <option value="registeredBy">Registered By</option>
            </select>
            <i
              className="bx bx-reset"
              onClick={() => {
                fetchVehicles();
                setSortField('latest');
                setSearchTerm('');
              }}
              title="Reload Vehicles"
              style={{ cursor: 'pointer', marginLeft: '8px' }}
            ></i>
            <i className="bx bx-plus" onClick={() => openForm(null, 'multiple', 'add')} title="Register Vehicles"></i>
          </div>
          <div className="table-container">
            <table className="compressed-table">
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Vehicles Count</th>
                  <th>Vehicle Details</th>
                  <th>Registered By</th>
                  <th>Date Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedVehicles.map((group) => (
                <tr key={group.cardNumber} className="vehicle-group-row">
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} title={group.cardNumber}>
                    <strong>{group.cardNumber}</strong>
                  </td>
                  <td title={group.userId}>{group.userId}</td>
                  <td title={group.userName}>{group.userName}</td>
                  <td title={`${group.vehicles.length} vehicle${group.vehicles.length !== 1 ? 's' : ''}`}>
                    <strong>{group.vehicles.length}</strong> vehicle{group.vehicles.length !== 1 ? 's' : ''}
                  </td>
                  <td className="vehicle-details-column">
                    <div style={{ lineHeight: '1.4' }}>
                      {/* Always show the first vehicle */}
                      {group.vehicles.length > 0 && (
                        <div style={{ 
                          marginBottom: group.vehicles.length > 1 ? '8px' : '0',
                          paddingBottom: group.vehicles.length > 1 ? '8px' : '0',
                          borderBottom: group.vehicles.length > 1 ? '1px solid #eee' : 'none'
                        }}>
                          <div style={{ marginBottom: '2px' }}>
                            <strong>{group.vehicles[0].icon} {group.vehicles[0].vehicleName}</strong>
                            {group.vehicles[0].plateNumber && <span style={{ marginLeft: '8px', color: '#666' }}>({group.vehicles[0].plateNumber})</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {group.vehicles[0].vehicleType} • {group.vehicles[0].category} • ₱{group.vehicles[0].price} • {group.vehicles[0].laneMeter}m
                          </div>
                        </div>
                      )}
                      
                      {/* Show remaining vehicles if expanded */}
                      {expandedCards.has(group.cardNumber) && group.vehicles.slice(1).map((vehicle, index) => (
                        <div key={vehicle._id} style={{ 
                          marginBottom: index < group.vehicles.slice(1).length - 1 ? '8px' : '0',
                          paddingBottom: index < group.vehicles.slice(1).length - 1 ? '8px' : '0',
                          borderBottom: index < group.vehicles.slice(1).length - 1 ? '1px solid #eee' : 'none'
                        }}>
                          <div style={{ marginBottom: '2px' }}>
                            <strong>{vehicle.icon} {vehicle.vehicleName}</strong>
                            {vehicle.plateNumber && <span style={{ marginLeft: '8px', color: '#666' }}>({vehicle.plateNumber})</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {vehicle.vehicleType} • {vehicle.category} • ₱{vehicle.price} • {vehicle.laneMeter}m
                          </div>
                        </div>
                      ))}
                      
                      {/* Show See More button if there are more than 1 vehicle */}
                      {group.vehicles.length > 1 && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            onClick={() => toggleCardExpansion(group.cardNumber)}
                            style={{
                              background: '#013986',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                          >
                            {expandedCards.has(group.cardNumber) ? (
                              <>
                                <i className="bx bx-chevron-up" style={{ fontSize: '12px', color: 'white' }}></i>
                                Show Less
                              </>
                            ) : (
                              <>
                                <i className="bx bx-chevron-down" style={{ fontSize: '12px', color: 'white' }}></i>
                                View All ({group.vehicles.length} vehicles)
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td title={group.registeredBy}>{group.registeredBy}</td>
                  <td title={group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}>
                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <i
                        className="bx bx-cog"
                        onClick={() => openForm(group.vehicles[0], 'multiple', 'manage')}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '16px',
                          color: '#5a5c69',
                          transition: 'color 0.15s ease-in-out'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#3a3b45'}
                        onMouseOut={(e) => e.target.style.color = '#5a5c69'}
                        title="Manage Vehicles"
                      ></i>
                      <i
                        className="bx bx-plus"
                        onClick={() => {
                          setFormData({ cardNumber: group.cardNumber, vehicleName: '', plateNumber: '', status: 'active' });
                          openForm(group.vehicles[0], 'multiple', 'add');
                        }}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '16px',
                          color: 'black',
                          transition: 'color 0.15s ease-in-out'
                        }}
                        title="Add More Vehicles"
                      ></i>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    Loading vehicles...
                  </td>
                </tr>
              )}
              {!loading && groupedVehicles.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No vehicles registered yet. Click the + button to register vehicles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Vehicle Registration Form */}
      {popupOpen && (
        <div 
          className="popup-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('popup-overlay')) {
              setPopupOpen(false);
            }
          }}
        >
          <div className="popup-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>
              {cardVehicles.length > 0 ? 'Manage Vehicle Registration' : 'Register Vehicles'}
            </h3>
            
            {/* Card Number Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Card Number *
              </label>
              <input 
                type="text" 
                name="cardNumber" 
                placeholder="Enter card number (e.g., 1234-5678-9101)" 
                value={formData.cardNumber} 
                onChange={handleInputChange}
                readOnly={popupOpen && formIntent === 'manage' || (formIntent === 'add' && formData.cardNumber && cardInfo)}
                style={{ 
                  marginBottom: '8px', 
                  width: '100%',
                  backgroundColor: (popupOpen && formIntent === 'manage') || (formIntent === 'add' && formData.cardNumber && cardInfo) ? '#f8f9fa' : '#fff',
                  cursor: (popupOpen && formIntent === 'manage') || (formIntent === 'add' && formData.cardNumber && cardInfo) ? 'not-allowed' : 'text'
                }}
              />
              {loading && <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>🔍 Validating card...</div>}
              {cardInfo && (
                <div style={{ 
                  fontSize: '13px', 
                  color: cardInfo.canRegisterMore ? '#28a745' : '#dc3545',
                  backgroundColor: cardInfo.canRegisterMore ? '#d4edda' : '#f8d7da',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${cardInfo.canRegisterMore ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  <strong>✓ Card Found:</strong><br/>
                  <div style={{ marginTop: '5px' }}>
                    <strong>Card Holder:</strong> {cardInfo.name} <br/>
                    <strong>User ID:</strong> {cardInfo.userId}<br/>
                    {cardInfo.email && (
                      <><strong>Email:</strong> {cardInfo.email} <br/></>
                    )}
                    {cardInfo.phone && (
                      <><strong>Phone:</strong> {cardInfo.phone} <br/></>
                    )}
                    <strong>Registered Vehicles:</strong> {cardInfo.vehicleCount}/5
                    {!cardInfo.canRegisterMore && (
                      <><br/><strong style={{ color: '#721c24' }}>⚠️ Maximum vehicle limit reached!</strong></>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Manage Card Vehicles Section */}
            {cardVehicles.length > 0 && formIntent === 'manage' && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>
                  Manage Card Vehicles ({cardVehicles.length}/5)
                </h4>
                <div style={{ maxHeight: '250px', overflow: 'auto' }}>
                  {cardVehicles.map((vehicle, index) => (
                    <div key={vehicle._id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e3e6f0',
                      boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: '#5a5c69' }}>{vehicle.icon} {vehicle.vehicleName}</strong><br/>
                        <span style={{ fontSize: '12px', color: '#6c757d' }}>
                          {vehicle.plateNumber ? `Plate: ${vehicle.plateNumber} | ` : ''}Type: {vehicle.vehicleType} | Price: ₱{vehicle.price}
                        </span>
                      </div>
                      <i 
                        className='bx bx-trash'
                        onClick={() => handleUnregisterVehicle(vehicle)}
                        style={{
                          color: '#e74a3b',
                          fontSize: '18px',
                          cursor: 'pointer',
                          transition: 'color 0.15s ease-in-out'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#c0392b'}
                        onMouseOut={(e) => e.target.style.color = '#e74a3b'}
                        title="Unregister Vehicle"
                      ></i>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formIntent === 'add' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e3e6f0'
                }}>
                  <h4 style={{ color: '#5a5c69', margin: 0, fontSize: '18px' }}>Vehicles to Register</h4>
                  <button
                    type="button"
                    onClick={addVehicleRow}
                    disabled={multipleVehicles.length >= 5 || (cardInfo && !cardInfo.canRegisterMore)}
                    style={{
                      backgroundColor: '#013986',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: (multipleVehicles.length >= 5 || (cardInfo && !cardInfo.canRegisterMore)) ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.15s ease-in-out',
                      opacity: (multipleVehicles.length >= 5 || (cardInfo && !cardInfo.canRegisterMore)) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px'
                    }}
                    onMouseOver={(e) => {
                      if (!e.target.disabled) e.target.style.backgroundColor = '#204d92';
                    }}
                    onMouseOut={(e) => {
                      if (!e.target.disabled) e.target.style.backgroundColor = '#013986';
                    }}
                    title="Add Vehicle"
                  >
                    <i className="bx bx-plus"></i>
                  </button>
                </div>

                {multipleVehicles.map((vehicle, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e3e6f0', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    marginBottom: '12px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '12px' 
                    }}>
                      <h5 style={{ 
                        margin: 0, 
                        color: '#5a5c69', 
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        Vehicle {index + 1}
                      </h5>
                      {multipleVehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVehicleRow(index)}
                          style={{
                            backgroundColor: '#e74a3b',
                            color: 'white',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'background-color 0.15s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e74a3b'}
                          title="Remove Vehicle"
                        >
                          <i className="bx bx-x"></i>
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: '#5a5c69',
                      }}>
                        Vehicle Type *
                      </label>
                      <select 
                        value={vehicle.vehicleName} 
                        onChange={(e) => handleMultipleVehicleChange(index, 'vehicleName', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '1px solid #d1d3e2',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          
                        }}
                      >
                        <option value="">Select Vehicle</option>
                        {vehicleCategories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name} - ₱{category.price} ({category.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {!['Bicycle', 'Bicycle with Sidecar'].includes(vehicle.vehicleName) && (
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '5px', 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          color: '#5a5c69'
                        }}>
                          Plate Number *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter plate number (e.g., ABC-1234)" 
                          value={vehicle.plateNumber} 
                          onChange={(e) => handleMultipleVehicleChange(index, 'plateNumber', e.target.value.toUpperCase())}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: '1px solid #d1d3e2',
                            fontSize: '14px',
                            textTransform: 'uppercase'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="popup-actions" style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px',
              paddingTop: '15px',
              borderTop: '1px solid #e3e6f0'
            }}>
              <button 
                onClick={() => setPopupOpen(false)}
                style={{
                  backgroundColor: '#aaa',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b3b3b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#aaa'}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddOrUpdate}
                disabled={loading || (cardInfo && !cardInfo.canRegisterMore) || formIntent === 'manage'}
                style={{
                   backgroundColor: '#013986',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: loading || (cardInfo && !cardInfo.canRegisterMore) || formIntent === 'manage' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.15s ease-in-out',
                  opacity: loading || (cardInfo && !cardInfo.canRegisterMore) || formIntent === 'manage' ? 0.6 : 1,
                  display: formIntent === 'add' ? 'inline-block' : 'none'
                }}
                onMouseOver={(e) => {
                  if (!e.target.disabled) e.target.style.backgroundColor = '#204d92';
                }}
                onMouseOut={(e) => {
                  if (!e.target.disabled) e.target.style.backgroundColor = '#013986';
                }}
              >
                {loading ? 'Processing...' : 'Register Vehicles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popups */}
      {showAddConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Vehicle Registration</h3>
            <p>Are you sure you want to register {multipleVehicles.filter(v => v.vehicleName && v.plateNumber).length} vehicle(s) to card <strong>{formData.cardNumber}</strong>?</p>
            <div className="popup-actions">
              <button onClick={() => setShowAddConfirmPopup(false)}>Cancel</button>
              <button onClick={confirmAdd} disabled={loading}>
                {loading ? 'Registering...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unregister Confirmation Popup */}
      {showUnregisterConfirmPopup && vehicleToUnregister && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Vehicle Unregistration</h3>
            <p>
              Are you sure you want to unregister vehicle <strong>{vehicleToUnregister.plateNumber}</strong> 
              ({vehicleToUnregister.vehicleName}) from card <strong>{vehicleToUnregister.cardNumber}</strong>?
            </p>
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              padding: '10px', 
              borderRadius: '5px', 
              margin: '10px 0',
              fontSize: '13px'
            }}>
              <strong>⚠️ Warning:</strong> This action cannot be undone. The vehicle will need to be registered again if required.
            </div>
            <div className="popup-actions">
              <button onClick={() => {
                setShowUnregisterConfirmPopup(false);
                setVehicleToUnregister(null);
              }}>Cancel</button>
              <button onClick={confirmUnregister} disabled={loading}>
                {loading ? 'Unregistering...' : 'Unregister'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}