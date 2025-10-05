import React, { useEffect, useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/Booking.css';
import '../../styles/table-compression.css';
import { generateBookingsPDF } from '../../utils/pdfUtils';
import { useSelector } from 'react-redux';
import { post, get, put } from '../../services/ApiEndpoint';

export default function SaBookings() {
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [fareCategories, setFareCategories] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedScheduleObj, setSelectedScheduleObj] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([
    { firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' },
  ]);
  
  const [vehicleDetails, setVehicleDetails] = useState([
    { vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 },
  ]);

  const validatePhilippinePhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.startsWith('63') && digits.length === 12) {
      return true;
    } else if (digits.startsWith('09') && digits.length === 11) {
      return true;
    }
    return false;
  };

  const formatPhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.startsWith('63')) {
      if (digits.length >= 12) {
        return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
      } else if (digits.length >= 8) {
        return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
      } else if (digits.length >= 5) {
        return `+63 ${digits.slice(2, 5)} ${digits.slice(5)}`;
      } else {
        return `+63 ${digits.slice(2)}`;
      }
    } else if (digits.startsWith('09')) {
      if (digits.length >= 11) {
        return `+63 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      } else if (digits.length >= 7) {
        return `+63 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else if (digits.length >= 4) {
        return `+63 ${digits.slice(1, 4)} ${digits.slice(4)}`;
      } else {
        return `+63 ${digits.slice(1)}`;
      }
    } else if (digits.startsWith('9') && digits.length <= 10) {
      if (digits.length >= 10) {
        return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      } else if (digits.length >= 6) {
        return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      } else if (digits.length >= 3) {
        return `+63 ${digits.slice(0, 3)} ${digits.slice(3)}`;
      } else {
        return `+63 ${digits}`;
      }
    }
    
    return phoneNumber;
  };

  const formatPhoneNumberForDisplay = (phoneNumber) => {
    if (!phoneNumber) return 'N/A';
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.startsWith('63') && digits.length >= 12) {
      const localNumber = '09' + digits.slice(2);
      return `${localNumber.slice(0, 4)} ${localNumber.slice(4, 7)} ${localNumber.slice(7, 11)}`;
    }
    if (digits.startsWith('09') && digits.length >= 11) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
    return phoneNumber;
  };

  // Function to format ticket type IDs to readable names
  const formatTicketTypeForDisplay = (ticketType) => {
    if (!ticketType) return 'N/A';
    
    const ticketTypeMap = {
      'adult_fare': 'Adult',
      'student_fare': 'Student', 
      'child_fare': 'Child',
      'infant_fare': 'Infant',
      'senior_fare': 'Senior',
      'regular': 'Regular',
      'Regular': 'Regular'
    };
    
    return ticketTypeMap[ticketType] || ticketType;
  };

  const handlePhoneNumberChange = (index, value) => {
    let cleanValue = value.replace(/[^\d+]/g, '');
    if (cleanValue.startsWith('+63')) {
      cleanValue = cleanValue.slice(3);
      cleanValue = '63' + cleanValue;
    } else if (cleanValue.startsWith('63')) {
    } else if (cleanValue.startsWith('09')) {
    } else if (cleanValue.startsWith('9')) {
      cleanValue = '0' + cleanValue;
    } else if (cleanValue.length > 0 && !cleanValue.startsWith('0')) {
      cleanValue = '09' + cleanValue;
    }

    if (cleanValue.startsWith('63') && cleanValue.length > 12) {
      cleanValue = cleanValue.slice(0, 12);
    } else if (cleanValue.startsWith('09') && cleanValue.length > 11) {
      cleanValue = cleanValue.slice(0, 11);
    }

    const updated = [...passengerDetails];
    updated[index].contactNumber = cleanValue;
    setPassengerDetails(updated);
  };

  const [formData, setFormData] = useState({
    bookingId: '',
    userId: '',
    departureLocation: '',
    arrivalLocation: '',
    departDate: '',
    departTime: '',
    arriveDate: '',
    arriveTime: '',
    passengers: 1,
    hasVehicle: false,
    vehicleType: '',
    vehicleSelect: '',
    status: 'active',
    shippingLine: '',
    schedcde: '',
    departurePort: '',
    arrivalPort: '',
    payment: '',
    paymentMethod: 'Card', 
    isPaid: 'false',
    bookingDate: '',
    passengerDetails: [],
    vehicleInfo: {},
    selectedSchedule: '',
    plateNumber: '',
    vehicleFare: '',
  });

  const [popupOpen, setPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');
  const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);
  const [showEditConfirmPopup, setShowEditConfirmPopup] = useState(false);

  const user = useSelector((state) => state.Auth?.user);

  const getBookingDate = (b) => {
    if (!b) return new Date(0);
    if (b.bookingDate) {
      const d = new Date(b.bookingDate);
      if (!isNaN(d)) return d;
    }
    if (b.createdAt) {
      const d = new Date(b.createdAt);
      if (!isNaN(d)) return d;
    }
    if (b._id && typeof b._id === 'string' && b._id.length >= 8) {
      try {
        const timestamp = parseInt(b._id.substring(0, 8), 16) * 1000;
        return new Date(timestamp);
      } catch {
      }
    }
    return new Date(0);
  };

  useEffect(() => {
    fetchBookings();
    fetchSchedules();
    fetchVehicleCategories();
    fetchFareCategories();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await get('/api/bookings');
      const payload = res?.data ?? res;
      console.log('Fetched bookings data:', payload); 
      setBookings(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      toast.error('Failed to load bookings');
      setBookings([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await get('/api/schedules');
      const payload = res?.data ?? res;
      setSchedules(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Fetch schedules error:', err);
      toast.error('Failed to load schedules');
      setSchedules([]);
    }
  };

  const fetchVehicleCategories = async () => {
    try {
      const res = await get('/api/sa-vehicles');
      const payload = res?.data ?? res;
      console.log('Fetched Vehicle Categories:', payload);
      const filteredCategories = Array.isArray(payload) ? payload.filter(cat => cat.type && ['TYPE 1', 'TYPE 2', 'TYPE 3', 'TYPE 4'].includes(cat.type)) : [];
      console.log('Filtered Vehicle Categories:', filteredCategories);
      setVehicleCategories(filteredCategories);
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      setVehicleCategories([]);
    }
  };

  const fetchFareCategories = async (ageOrBirthday) => {
    try {
      console.log('Fetching fare categories from /api/sa-fares');
      const res = await get('/api/sa-fares');
      console.log('API Response:', res);
      const fareCategories = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

    const computeAge = (val) => {
      if (val == null) return null;
      
      if (typeof val === 'number' && !isNaN(val)) {
        if (val > 1900 && val <= new Date().getFullYear()) {
          return new Date().getFullYear() - val;
        } else if (val >= 0 && val <= 150) {
          return val;
        }
        return null;
      }
      
      const str = String(val).trim();
      if (str === '') return null;
      
      const yearMatch = str.match(/^\d{4}$/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        if (year > 1900 && year <= new Date().getFullYear()) {
          return new Date().getFullYear() - year;
        }
        return null;
      }
      
      const d = new Date(val);
      if (isNaN(d)) return null;
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    };      const parseAgeRangeMatches = (age, category) => {
        if (typeof category !== 'object' || category == null) return false;
        const ar = (category.ageRange || '').toString().trim();
        if (ar) {
          const rangeMatch = ar.match(/^(\d+)\s*-\s*(\d+)/);
          if (rangeMatch) {
            const min = parseInt(rangeMatch[1], 10);
            const max = parseInt(rangeMatch[2], 10);
            return age >= min && age <= max;
          }
          const plusMatch = ar.match(/^(\d+)\s*\+/);
          if (plusMatch) {
            const min = parseInt(plusMatch[1], 10);
            return age >= min;
          }
          const singleMatch = ar.match(/^(\d+)$/);
          if (singleMatch) return age === parseInt(singleMatch[1], 10);
        }

        if (typeof category.minAge === 'number') {
          const min = category.minAge;
          const max = (category.maxAge === null || category.maxAge === undefined) ? null : Number(category.maxAge);
          return age >= min && (max === null || age <= max);
        }

        return false;
      };

      const numericAge = computeAge(ageOrBirthday);
      const activeFares = fareCategories.filter((c) => (c && (c.isActive === undefined || c.isActive === true)));
      let filtered;
      if (numericAge === null) {
        filtered = activeFares;
      } else {
        filtered = activeFares.filter((category) => parseAgeRangeMatches(numericAge, category));
      }

      if (!filtered || filtered.length === 0) {
        toast.error('No fare categories found for the given age');
      } else {
        console.log('Filtered Categories:', filtered);
      }

      setFareCategories(filtered);
    } catch (err) {
      console.error('Error fetching fare categories:', err);
      toast.error('Failed to fetch fare categories');
    }
  };

  const availableDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = (schedules || [])
      .filter((schedule) => {
        if (!schedule || !schedule.date) return false;
        const schedDate = new Date(schedule.date);
        schedDate.setHours(0, 0, 0, 0);
        const hasCapacity =
          (typeof schedule.passengerBooked === 'number' && typeof schedule.passengerCapacity === 'number' && schedule.passengerBooked < schedule.passengerCapacity) ||
          (typeof schedule.vehicleBooked === 'number' && typeof schedule.vehicleCapacity === 'number' && schedule.vehicleBooked < schedule.vehicleCapacity);
        return schedDate >= today && hasCapacity;
      })
      .map((schedule) => {
        const d = new Date(schedule.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
    return Array.from(new Set(dates));
  }, [schedules]);

  const resetBookingForm = () => {
    setPassengerDetails([{ firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' }]);
    setVehicleDetails([{ vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 }]);
    setFormData((prev) => ({
      ...prev,
      passengers: 1,
      userId: '',
      departureLocation: '',
      arrivalLocation: '',
      departDate: '',
      departTime: '',
      arriveDate: '',
      arriveTime: '',
      hasVehicle: false,
      vehicleType: '',
      vehicleSelect: '',
      status: 'active',
      shippingLine: '',
      schedcde: '',
      departurePort: '',
      arrivalPort: '',
      payment: '',
      paymentMethod: 'Card', 
      isPaid: 'false',
      bookingDate: '',
      passengerDetails: [],
      vehicleInfo: {},
      selectedSchedule: '',
      plateNumber: '',
      vehicleFare: '',
    }));
    setSelectedScheduleObj(null);
    setEditId(null);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!popupOpen) resetBookingForm();
  }, [popupOpen]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortField(e.target.value);
  const resetSorting = () => {
  };

  const displayedBookings = useMemo(() => {
    let list = Array.isArray(bookings) ? [...bookings] : [];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((b) => {
        const ref = (b.bookingReference || b.bookingId || '').toLowerCase();
        const dep = (b.departureLocation || '').toLowerCase();
        const arr = (b.arrivalLocation || '').toLowerCase();
        const userId = (b.userId || '').toLowerCase();
        const shippingLine = (b.shippingLine || '').toLowerCase();
        const plateNumber = (b.vehicleInfo?.plateNumber || '').toLowerCase();
        
        const passengerMatch = b.passengerDetails && b.passengerDetails.some(p => {
          const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
          const contact = (p.contactNumber || '').toLowerCase();
          const ticketType = (p.ticketType || '').toLowerCase();
          return fullName.includes(term) || contact.includes(term) || ticketType.includes(term);
        });
        
        return ref.includes(term) || dep.includes(term) || arr.includes(term) || 
               userId.includes(term) || shippingLine.includes(term) || 
               plateNumber.includes(term) || passengerMatch;
      });
    }

    if (sortField) {
      if (sortField === 'latest') {
        list.sort((a, b) => getBookingDate(b) - getBookingDate(a));
      } else if (sortField === 'oldest') {
        list.sort((a, b) => getBookingDate(a) - getBookingDate(b));
      } else {
        list.sort((a, b) => {
          if (sortField === 'bookingId') return (a.bookingReference || a.bookingId || '').localeCompare(b.bookingReference || b.bookingId || '');
          if (sortField === 'departureLocation') return (a.departureLocation || '').localeCompare(b.departureLocation || '');
          if (sortField === 'arrivalLocation') return (a.arrivalLocation || '').localeCompare(b.arrivalLocation || '');
          if (sortField === 'shippingLine') return (a.shippingLine || '').localeCompare(b.shippingLine || '');
          if (sortField === 'userId') return (a.userId || a.userID || '').localeCompare(b.userId || b.userID || '');
          if (sortField === 'payment') return parseFloat(a.payment || a.totalFare || 0) - parseFloat(b.payment || b.totalFare || 0);
          if (sortField === 'date') return new Date(a.departDate || 0) - new Date(b.departDate || 0);
          if (sortField === 'passengers') return (a.passengers || (a.passengerDetails ? a.passengerDetails.length : 0)) - (b.passengers || (b.passengerDetails ? b.passengerDetails.length : 0));
          if (sortField === 'hasVehicle') return (a.hasVehicle === b.hasVehicle) ? 0 : (a.hasVehicle ? -1 : 1);
          if (sortField === 'active') return (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1);
          if (sortField === 'cancelled') return (a.status === 'cancelled' ? 0 : 1) - (b.status === 'cancelled' ? 0 : 1);
          return 0;
        });
      }
    }

    return list;
  }, [bookings, searchTerm, sortField]);

  // Booking ID generator
  const generateBookingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'BK';
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const openForm = (booking = null) => {
    if (booking && booking._id) {
      setEditId(booking._id);
      setFormData((prev) => ({
        ...prev,
        bookingId: booking.bookingId || booking.bookingReference || generateBookingId(),
        userId: booking.userId || '',
        departureLocation: booking.departureLocation || '',
        arrivalLocation: booking.arrivalLocation || '',
        departDate: booking.departDate || '',
        departTime: booking.departTime || '',
        arriveDate: booking.arriveDate || '',
        arriveTime: booking.arriveTime || '',
        passengers: booking.passengers ?? 1,
        hasVehicle: booking.hasVehicle ?? (booking.vehicleInfo && Object.keys(booking.vehicleInfo).length > 0),
        vehicleType: booking.vehicleType || '',
        vehicleSelect: booking.vehicleSelect || '',
        status: booking.status || 'active',
        shippingLine: booking.shippingLine || '',
        schedcde: booking.schedcde || '',
        departurePort: booking.departurePort || '',
        arrivalPort: booking.arrivalPort || '',
        payment: booking.payment ?? booking.totalFare ?? '',
        paymentMethod: booking.paymentMethod || 'Card', 
        isPaid: booking.isPaid || 'false',
        bookingDate: booking.bookingDate || booking.createdAt || '',
        passengerDetails: Array.isArray(booking.passengerDetails) ? booking.passengerDetails : passengerDetails,
        vehicleInfo: booking.vehicleInfo || {},
        selectedSchedule: booking.selectedSchedule || '',
      }));
      setPassengerDetails(Array.isArray(booking.passengerDetails) && booking.passengerDetails.length ? 
        booking.passengerDetails.map(p => ({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : null,
          fareCategory: p.ticketType || p.fareCategory || '',
          fareAmount: p.fare || p.fareAmount || 470,
          contactNumber: p.contactNumber || '',
          idNumber: p.idNumber || ''
        })) : 
        [{ firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' }]
      );
      
      setVehicleDetails(booking.vehicleInfo && Object.keys(booking.vehicleInfo).length > 0 ? 
        [{
          vehicleType: booking.vehicleInfo.vehicleType || '',
          vehicleSelect: (() => {
            const matchingVehicle = vehicleCategories.find(v => v.name === booking.vehicleInfo.vehicleCategory);
            return matchingVehicle ? matchingVehicle._id : '';
          })(),
          plateNumber: booking.vehicleInfo.plateNumber || '',
          fareAmount: (() => {
            const totalPayment = booking.payment || 0;
            const passengerTotal = (booking.passengerDetails || []).reduce((sum, p) => sum + (p.fare || 0), 0);
            return Math.max(0, totalPayment - passengerTotal); 
          })()
        }] : 
        [{ vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 }]
      );
      setIsEditing(true);
      setPopupOpen(true);
    } else {
      setEditId(null);
      setFormData((prev) => ({
        ...prev,
        bookingId: generateBookingId(),
        userId: '',
        departureLocation: '',
        arrivalLocation: '',
        departDate: '',
        departTime: '',
        arriveDate: '',
        arriveTime: '',
        passengers: 1,
        hasVehicle: false,
        vehicleType: '',
        vehicleSelect: '',
        status: 'active',
        shippingLine: user?.shippingLines ?? '',
        schedcde: '',
        departurePort: '',
        arrivalPort: '',
        payment: '',
        paymentMethod: 'Card', 
        isPaid: 'false',
        bookingDate: new Date().toISOString(),
        passengerDetails: [],
        vehicleInfo: {},
        selectedSchedule: '',
      }));
      setPassengerDetails([{ firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' }]);
      setVehicleDetails([{ vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 }]);
      setIsEditing(false);
      setPopupOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleScheduleChange = (valOrEvent) => {
    const selectedScheduleId = typeof valOrEvent === 'string' ? valOrEvent : valOrEvent?.target?.value;
    const selected = (schedules || []).find((s) => s._id === selectedScheduleId);
    setSelectedScheduleObj(selected || null);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        selectedSchedule: selectedScheduleId,
        departureLocation: selected.from || prev.departureLocation,
        arrivalLocation: selected.to || prev.arrivalLocation,
        departDate: selected.date || prev.departDate,
        departTime: selected.departureTime || prev.departTime,
        arriveDate: selected.arrivalDate ? String(selected.arrivalDate) : prev.arriveDate,
        arriveTime: selected.arrivalTime || prev.arriveTime,
        schedcde: selected.schedcde || prev.schedcde,
        departurePort: selected.from || prev.departurePort,
        arrivalPort: selected.to || prev.arrivalPort,
        shippingLine: selected.shippingLines || prev.shippingLine,
      }));
      try {
        const sd = new Date(selected.date);
        if (!isNaN(sd)) setSelectedDate(sd);
      } catch {}
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedSchedule: '',
        departureLocation: '',
        arrivalLocation: '',
        departDate: '',
        departTime: '',
        arriveDate: '',
        arriveTime: '',
        schedcde: '',
        departurePort: '',
        arrivalPort: '',
        shippingLine: '',
      }));
      setSelectedScheduleObj(null);
    }
  };

  const handleAddOrUpdate = () => {
    const requiredFields = [
      'bookingId',
      'userId',
      'departureLocation',
      'arrivalLocation',
      'departDate',
      'departTime',
      'arriveDate',
      'arriveTime',
      'passengers',
      'status',
      'shippingLine',
      'schedcde',
      'departurePort',
      'arrivalPort',
      'isPaid',
      'bookingDate',
      'paymentMethod', 
    ];

    const missingFields = requiredFields.filter((f) => {
      const v = formData[f];
      return v === '' || v === undefined || v === null;
    });

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!passengerDetails || passengerDetails.length === 0) {
      toast.error('Please add at least one passenger.');
      return;
    }

    const invalidPassengers = passengerDetails.filter(p => {
      const basicFieldsMissing = !p.firstName || !p.lastName || !p.contactNumber || !p.birthday || !p.fareCategory;
      const idRequiredCategories = ['student_fare', 'senior_fare', 'pwd_fare'];
      const idNumberMissing = idRequiredCategories.includes(p.fareCategory) && !p.idNumber;
      
      return basicFieldsMissing || idNumberMissing;
    });

    if (invalidPassengers.length > 0) {
      toast.error('Please complete all passenger details. ID Number is required for Student, Senior, and PWD fares.');
      return;
    }

    const invalidContacts = passengerDetails.filter(p => 
      !p.contactNumber || !validatePhilippinePhoneNumber(p.contactNumber)
    );
    
    if (invalidContacts.length > 0) {
      toast.error('Please provide valid Philippine phone numbers for all passengers.');
      return;
    }

    if (formData.hasVehicle) {
      if (!vehicleDetails || vehicleDetails.length === 0) {
        toast.error('Please add at least one vehicle.');
        return;
      }
      
      const incompleteVehicles = vehicleDetails.filter(v => 
        !v.vehicleType || !v.plateNumber || (!v.fareAmount && v.fareAmount !== 0)
      );
      
      if (incompleteVehicles.length > 0) {
        toast.error('Please complete all vehicle details.');
        return;
      }
    }

    if (editId) setShowEditConfirmPopup(true);
    else setShowAddConfirmPopup(true);
  };

  const confirmAdd = async () => {
    try {
      const formattedPassengerDetails = passengerDetails.map(p => ({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        contactNumber: p.contactNumber || '',
        ticketType: p.fareCategory || 'Regular', 
        fare: p.fareAmount || 0, 
        birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Format as date string
        idNumber: p.idNumber || ''
      }));

      const formattedVehicleInfo = formData.hasVehicle && vehicleDetails.length > 0 ? {
        vehicleCategory: (() => {
          const selectedVehicle = vehicleCategories.find(v => v._id === vehicleDetails[0].vehicleSelect);
          return selectedVehicle ? selectedVehicle.name : '';
        })(),
        plateNumber: vehicleDetails[0].plateNumber || '',
        vehicleType: vehicleDetails[0].vehicleType || ''
      } : {};

      // Calculate total payment
      const passengerTotal = formattedPassengerDetails.reduce((sum, p) => sum + (p.fare || 0), 0);
      const vehicleTotal = formData.hasVehicle ? (vehicleDetails || []).reduce((sum, v) => sum + (v.fareAmount || 0), 0) : 0;
      const totalPayment = passengerTotal + vehicleTotal;

      const bookingData = {
        userId: formData.userId,
        bookingId: formData.bookingId,
        departureLocation: selectedScheduleObj?.from || formData.departureLocation,
        arrivalLocation: selectedScheduleObj?.to || formData.arrivalLocation,
        departDate: new Date(selectedScheduleObj?.date || formData.departDate).toISOString(), 
        departTime: selectedScheduleObj?.departureTime || formData.departTime,
        arriveDate: selectedScheduleObj?.arrivalDate ? String(selectedScheduleObj.arrivalDate) : formData.arriveDate,
        arriveTime: selectedScheduleObj?.arrivalTime || formData.arriveTime,
        passengers: passengerDetails.length,
        hasVehicle: formData.hasVehicle || false,
        vehicleType: formData.hasVehicle ? vehicleDetails[0]?.vehicleType || '' : '',
        status: formData.status || 'active',
        shippingLine: selectedScheduleObj?.shippingLines || formData.shippingLine || user?.shippingLines || '',
        schedcde: selectedScheduleObj?.schedcde || formData.schedcde,
        departurePort: selectedScheduleObj?.from || formData.departurePort,
        arrivalPort: selectedScheduleObj?.to || formData.arrivalPort,
        payment: totalPayment,
        paymentMethod: formData.paymentMethod || 'Card',
        isPaid: formData.isPaid || 'false',
        bookingDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD string 
        passengerDetails: formattedPassengerDetails,
        vehicleInfo: formattedVehicleInfo
      };

      if (!bookingData.userId || !bookingData.bookingId || !bookingData.departureLocation || 
          !bookingData.arrivalLocation || !bookingData.shippingLine || !bookingData.schedcde) {
        toast.error('Missing required booking information. Please check all fields.');
        return;
      }

      console.log('Sending booking data:', bookingData); 
      console.log('Formatted passenger details:', formattedPassengerDetails);

      const res = await post('/api/bookings', bookingData);
      const created = res?.data ?? res;
      
      await fetchBookings();
      
      AddAudit();
      toast.success('Booking added successfully!');
    } catch (err) {
      console.error('Add booking error:', err);
      console.error('Error details:', err.response?.data);
      toast.error(`Failed to add booking: ${err.response?.data?.error || err.message}`);
    } finally {
      resetForm();
      setShowAddConfirmPopup(false);
    }
  };

  // Audit trail
  const AddAudit = async (status = '', ids = '', bookingstat) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const name = user?.name || 'Unknown User';
    const userID = user?.adminId || user?.id || 'Unknown User ID';
    let actiontxt = '';
    if (status === 'status') {
      actiontxt = `Changed Status Bookings: ${ids} to ${bookingstat === 'Active' ? 'Cancelled' : 'Active'}`;
    } else {
      actiontxt = (isEditing ? 'Updated Bookings: ' : 'Added Bookings: ') + (formData.bookingId || ids);
    }
    const auditData = { date: formattedDate, name, userID, action: actiontxt };
    try {
      await post('/api/audittrails', auditData);
    } catch (err) {
      console.error('Add audit error:', err);
      // don't block main flow
    }
  };

  const confirmEdit = async () => {
    try {
      const formattedPassengerDetails = passengerDetails.map(p => ({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        contactNumber: p.contactNumber || '',
        ticketType: p.fareCategory || 'Regular', 
        fare: p.fareAmount || 0, 
        birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        idNumber: p.idNumber || '',
        _id: p._id 
      }));

      const formattedVehicleInfo = formData.hasVehicle && vehicleDetails.length > 0 ? {
        vehicleCategory: (() => {
          const selectedVehicle = vehicleCategories.find(v => v._id === vehicleDetails[0].vehicleSelect);
          return selectedVehicle ? selectedVehicle.name : '';
        })(),
        plateNumber: vehicleDetails[0].plateNumber || '',
        vehicleType: vehicleDetails[0].vehicleType || ''
      } : {};

      // Calculate total payment
      const passengerTotal = formattedPassengerDetails.reduce((sum, p) => sum + (p.fare || 0), 0);
      const vehicleTotal = formData.hasVehicle ? (vehicleDetails || []).reduce((sum, v) => sum + (v.fareAmount || 0), 0) : 0;
      const totalPayment = passengerTotal + vehicleTotal;

      const selectedSchedule = (schedules || []).find((s) => s._id === formData.selectedSchedule);
      
      const bookingData = {
        userId: formData.userId,
        bookingId: formData.bookingId,
        departureLocation: selectedSchedule?.from || formData.departureLocation,
        arrivalLocation: selectedSchedule?.to || formData.arrivalLocation,
        departDate: selectedSchedule?.date || formData.departDate,
        departTime: selectedSchedule?.departureTime || formData.departTime,
        arriveDate: selectedSchedule?.arrivalDate ? String(selectedSchedule.arrivalDate) : formData.arriveDate,
        arriveTime: selectedSchedule?.arrivalTime || formData.arriveTime,
        passengers: passengerDetails.length,
        hasVehicle: formData.hasVehicle || false,
        vehicleType: formData.hasVehicle ? vehicleDetails[0]?.vehicleType : '',
        status: formData.status || 'active',
        shippingLine: selectedSchedule?.shippingLines || formData.shippingLine,
        schedcde: selectedSchedule?.schedcde || formData.schedcde,
        departurePort: selectedSchedule?.from || formData.departurePort,
        arrivalPort: selectedSchedule?.to || formData.arrivalPort,
        payment: totalPayment,
        paymentMethod: formData.paymentMethod || 'Card',
        isPaid: formData.isPaid || 'false',
        bookingDate: formData.bookingDate || new Date().toISOString(),
        passengerDetails: formattedPassengerDetails,
        vehicleInfo: formattedVehicleInfo
      };

      console.log('Updating booking data:', bookingData); 

      const res = await put(`/api/bookings/${editId}`, bookingData);
      const updated = res?.data ?? res;
      
      await fetchBookings();
      
      AddAudit();
      toast.success('Booking updated successfully!');
    } catch (err) {
      console.error('Edit booking error:', err);
      console.error('Error details:', err.response?.data);
      toast.error(`Failed to update booking: ${err.response?.data?.error || err.message}`);
    } finally {
      resetForm();
      setShowEditConfirmPopup(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bookingId: '',
      userId: '',
      departureLocation: '',
      arrivalLocation: '',
      departDate: '',
      departTime: '',
      arriveDate: '',
      arriveTime: '',
      passengers: 1,
      hasVehicle: false,
      vehicleType: '',
      status: 'active',
      shippingLine: '',
      schedcde: '',
      departurePort: '',
      arrivalPort: '',
      payment: '',
      paymentMethod: 'Card', 
      isPaid: 'false',
      bookingDate: '',
      passengerDetails: [],
      vehicleInfo: {},
      selectedSchedule: '',
      vehicleSelect: '',
      plateNumber: '',
      vehicleFare: '',
    });
    setPassengerDetails([{ firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' }]);
    setVehicleDetails([{ vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 }]);
    setEditId(null);
    setPopupOpen(false);
    setIsEditing(false);
    setSelectedScheduleObj(null);
  };

  // Helpers
  const extractType = (cardType) => {
    const match = (cardType || '').match(/^Type \d+/);
    return match ? match[0] : '';
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h || typeof time12h !== 'string') return time12h || '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const formatTo12Hour = (time) => {
    if (!time) return '';
    let [hour, minute] = time.split(':');
    hour = parseInt(hour, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // Toggle status
  const handleStatusClick = async (booking) => {
    if (booking.isPaid === 'entered') {
      toast.error('Cannot change status when payment is entered');
      return;
    }
    if (booking.isPaid === 'false') {
      toast.error('Cannot change status when payment is not completed');
      return;
    }
    const newStatus = booking.status === 'active' ? 'cancelled' : 'active';
    try {
      const res = await put(`/api/bookings/${booking._id}`, { status: newStatus });
      const updated = res?.data ?? res;
      
      await fetchBookings();
      
      AddAudit('status', booking.bookingId || booking.bookingReference || booking._id, booking.status);
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Failed to update status');
    }
  };

  // PDF export
  const handleDownloadPDF = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    generateBookingsPDF(displayedBookings, 'bookings-report');
  };

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString();
  };

  const formatScheduleDisplay = (schedule) => {
    try {
      const formattedDate = new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const availablePassengers = schedule.passengerCapacity - schedule.passengerBooked;
      const availableVehicles = schedule.vehicleCapacity - schedule.vehicleBooked;
      return `Route: ${schedule.from} → ${schedule.to}\nDate: ${formattedDate}\nDeparture: ${formatTo12Hour(schedule.departureTime)}\nShipping Line: ${schedule.shippingLines}\nAvailable: ${availablePassengers} passengers, ${availableVehicles} vehicles`;
    } catch {
      return `${schedule.from} → ${schedule.to}`;
    }
  };

  const formatScheduleTooltip = (schedule) => {
    try {
      const formattedDate = new Date(schedule.date).toLocaleDateString();
      const availablePassengers = schedule.passengerCapacity - schedule.passengerBooked;
      const availableVehicles = schedule.vehicleCapacity - schedule.vehicleBooked;
      return `Route: ${schedule.from} → ${schedule.to}\nDate: ${formattedDate}\nTime: ${formatTo12Hour(schedule.departureTime)}\nShipping Line: ${schedule.shippingLines}\nAvailable: ${availablePassengers} passengers, ${availableVehicles} vehicles`;
    } catch {
      return '';
    }
  };

  // Get schedules for selected date 
  const getAvailableSchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setHours(0, 0, 0, 0);
    return (schedules || [])
      .filter((schedule) => {
        if (!schedule || !schedule.date) return false;
        const schedDate = new Date(schedule.date);
        schedDate.setHours(0, 0, 0, 0);
        const hasCapacity =
          (typeof schedule.passengerBooked === 'number' && typeof schedule.passengerCapacity === 'number' && schedule.passengerBooked < schedule.passengerCapacity) ||
          (typeof schedule.vehicleBooked === 'number' && typeof schedule.vehicleCapacity === 'number' && schedule.vehicleBooked < schedule.vehicleCapacity);
        return schedDate >= today && schedDate.getTime() === selectedDateCopy.getTime() && hasCapacity;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  useEffect(() => {
    const types = Array.from(new Set(vehicleCategories.map((cat) => cat.type)));
    setVehicleTypes(types);
  }, [vehicleCategories]);

  const addVehicleDetail = () => {
    setVehicleDetails([...vehicleDetails, { vehicleType: '', vehicleSelect: '', plateNumber: '', fareAmount: 0 }]);
  };

  const removeVehicleDetail = (index) => {
    setVehicleDetails(vehicleDetails.filter((_, i) => i !== index));
  };

  const updateVehicleDetail = (index, field, value) => {
    const updatedDetails = [...vehicleDetails];
    
    if (field === 'vehicleType') {
      updatedDetails[index].vehicleType = value;
      updatedDetails[index].vehicleSelect = '';
      updatedDetails[index].fareAmount = 0;
    } else if (field === 'vehicleSelect') {
      const selectedVehicle = vehicleCategories.find(v => v._id === value);
      updatedDetails[index].vehicleSelect = value;
      updatedDetails[index].fareAmount = selectedVehicle ? selectedVehicle.price : 0;
    } else {
      updatedDetails[index][field] = value;
    }
    
    setVehicleDetails(updatedDetails);
  };

  const getFilteredVehiclesForType = (vehicleType) => {
    return vehicleCategories.filter(cat => cat.type === vehicleType);
  };

  const totalVehicleFare = useMemo(() => {
    return vehicleDetails.reduce((sum, vehicle) => sum + (vehicle.fareAmount || 0), 0);
  }, [vehicleDetails]);

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
              <i className="bx bx-search" />
            </div>

            <select className="sort-select" value={sortField} onChange={handleSortChange}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="bookingId">Booking ID</option>
              <option value="departureLocation">Departure Location</option>
              <option value="shippingLine">Shipping Line</option>
              <option value="userId">User ID</option>
              <option value="payment">Payment</option>
              <option value="date">Date</option>
              <option value="passengers">Passengers Count</option>
              <option value="hasVehicle">Has Vehicle</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <i
              className="bx bx-reset"
              onClick={fetchBookings}
              title="Reload Bookings"
              style={{ cursor: 'pointer', marginLeft: '8px' }}
            />

            <i className="bx bx-plus" onClick={() => openForm()} style={{ cursor: 'pointer' }}></i>
          </div>

          <div className="wide-table-container">
            <table className="wide-table">
              <thead>
                <tr>
                  <th style={{textAlign: "center", verticalAlign: "middle"}}>Booking ID</th>
                  <th>User ID</th>
                  <th>Route</th>
                  <th>Depart Date</th>
                  <th style={{ minWidth: "100px" }}>Depart Time</th>
                  <th>Arrive Date</th>
                  <th style={{ minWidth: "100px" }}>Arrive Time</th>
                  <th>Passengers Count</th>
                  <th style={{ minWidth: "200px" }}>Passenger Names</th>
                  <th style={{ minWidth: "150px" }}>Contact Numbers</th>
                  <th>Ticket Type</th>
                  {/* <th>Passenger Fares</th> */}
                  <th>Birthday</th>
                  <th>ID Number</th>
                  <th>Has Vehicle</th>
                  <th style={{ minWidth: "170px" }}>Vehicle Category</th>
                  <th style={{ minWidth: "100px" }}>Vehicle Type</th>
                  <th>Plate Number</th>
                  <th>Shipping Line</th>
                  <th>Sched Code</th>
                  <th>Departure Port</th>
                  <th>Arrival Port</th>
                  <th>Total Payment</th>
                  <th>Payment Method</th>
                  <th>Paid Status</th>
                  <th style={{ minWidth: "180px" }}>Booking Date</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
            <tbody>
              {Array.isArray(displayedBookings) && displayedBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingId ?? b.bookingReference}</td>
                  <td>{b.userId}</td>
                  <td>{b.departureLocation} → {b.arrivalLocation}</td>
                  <td>{formatDate(b.departDate)}</td>
                  <td>{formatTo12Hour(b.departTime)}</td>
                  <td>{formatDate(b.arriveDate)}</td>
                  <td>{formatTo12Hour(b.arriveTime)}</td>
                  <td>{b.passengers || (b.passengerDetails ? b.passengerDetails.length : 0)}</td>
                  <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {p.firstName} {p.lastName}
                          </div>
                        ))
                      : 'No passengers'
                    }
                  </td>
                  <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {formatPhoneNumberForDisplay(p.contactNumber)}
                          </div>
                        ))
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {formatTicketTypeForDisplay(p.ticketType)}
                          </div>
                        ))
                      : 'N/A'
                    }
                  </td>
                  {/* <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {p.fare ? `₱${p.fare.toLocaleString()}` : 'N/A'}
                          </div>
                        ))
                      : 'N/A'
                    }
                  </td> */}
                  <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {p.birthday ? formatDate(p.birthday) : 'N/A'}
                          </div>
                        ))
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {b.passengerDetails && b.passengerDetails.length > 0 
                      ? b.passengerDetails.map((p, i) => (
                          <div key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>
                            {p.idNumber || 'N/A'}
                          </div>
                        ))
                      : 'N/A'
                    }
                  </td>
                  <td>{b.hasVehicle ? 'Yes' : 'No'}</td>
                  <td>{b.vehicleInfo?.vehicleCategory || 'N/A'}</td>
                  <td>{b.vehicleInfo?.vehicleType || b.vehicleType || 'N/A'}</td>
                  <td>{b.vehicleInfo?.plateNumber || 'N/A'}</td>
                  <td>{b.shippingLine}</td>
                  <td>{b.schedcde}</td>
                  <td>{b.departurePort}</td>
                  <td>{b.arrivalPort}</td>
                  <td>{typeof b.payment === 'number' ? `₱${b.payment.toLocaleString()}` : `₱${b.payment ?? 0}`}</td>
                  <td>{b.paymentMethod || 'Not specified'}</td>
                  <td>{b.isPaid}</td>
                  <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</td>
                  {/* <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                  <td>{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td> */}
                  <td>
                    <span
                      className={`status ${
                        b.isPaid === 'entered' ? 'completed' : 
                        b.isPaid === 'false' ? 'pending' : 
                        b.status
                      }`}
                      onClick={() => handleStatusClick(b)}
                      style={{ cursor: 'pointer' }}
                    >
                      {b.isPaid === 'entered' ? 'completed' : 
                      b.isPaid === 'false' ? 'pending' : 
                      b.status}
                    </span>
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
      </div>

      {/* Add/Edit Popup */}
        {popupOpen && (
          <div className="popup-overlay" onClick={(e) => { if (e.target.classList.contains('popup-overlay')) setPopupOpen(false); }}>
            <div className="popup-content booking-form">
              <h3>{isEditing ? 'Edit Booking' : 'Add New Booking'}</h3>

              <div className="booking-form-layout">
                {/* Left Column - Calendar and Schedule */}
                <div className="left-column">
                  <div className="calendar-section">
                    <label className="section-label">Select Date</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      dateFormat="MMM dd, yyyy"
                      className="calendar-input-large"
                      inline
                      dayClassName={(date) => {
                        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                        return availableDates.includes(d) ? 'react-datepicker__day--highlighted' : undefined;
                      }}
                    />
                  </div>

                  {/* Available Schedules */}
                  <div className="schedule-section">
                    <label className="section-label">Available Schedules</label>
                    <div className="schedule-list">
                      {getAvailableSchedules().length === 0 ? (
                        <div className="no-schedules">No available schedules for selected date</div>
                      ) : (
                        getAvailableSchedules().map((schedule) => (
                          <div
                            key={schedule._id}
                            className={`schedule-item ${formData.selectedSchedule === schedule._id ? 'selected' : ''}`}
                            onClick={() => handleScheduleChange(schedule._id)}
                          >
                            <div className="schedule-route">{schedule.from} → {schedule.to}</div>
                            <div className="schedule-info">
                              <span className="schedule-time">{formatTo12Hour(schedule.departureTime)}</span>
                              <span className="schedule-line">{schedule.shippingLines}</span>
                            </div>
                            <div className="schedule-capacity">
                              <span>Passengers: {schedule.passengerCapacity - schedule.passengerBooked}</span>
                              <span>Vehicles: {schedule.vehicleCapacity - schedule.vehicleBooked}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Form Fields */}
                <div className="middle-column">
                  <div className="field-section">
                    <label>Shipping Line</label>
                    <input
                      type="text"
                      name="shippingLine"
                      placeholder="Shipping Line *"
                      value={formData.shippingLine}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </div>

                  <div className="form-separator"></div>

                  {/* Basic Details */}
                  <div className="field-section">
                    <h4 className="section-title">Booking Details</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Booking ID</label>
                        <input
                          type="text"
                          name="bookingId"
                          placeholder="Booking ID *"
                          value={formData.bookingId}
                          onChange={handleInputChange}
                          readOnly
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>User ID</label>
                        <input
                          type="text"
                          name="userId"
                          placeholder="User ID *"
                          value={formData.userId}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-separator"></div>

                  {/* Passenger Details */}
                  <div className="field-section">
                    <h4 className="section-title">Passenger Details</h4>
                    <div className="details-container">
                      {passengerDetails.map((p, idx) => (
                        <div key={idx} className="detail-card">
                          <div className="card-header">
                            <span>Passenger {idx + 1}</span>
                            {idx > 0 && (
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() => setPassengerDetails(passengerDetails.filter((_, i) => i !== idx))}
                              >
                                <i className="bx bx-x"></i>
                              </button>
                            )}
                          </div>
                          <div className="form-row">
                            <div className="form-field">
                              <label>First Name</label>
                              <input
                                type="text"
                                placeholder="First Name *"
                                value={p.firstName}
                                onChange={(e) => {
                                  const updated = [...passengerDetails];
                                  updated[idx].firstName = e.target.value;
                                  setPassengerDetails(updated);
                                }}
                                required
                              />
                            </div>
                            <div className="form-field">
                              <label>Last Name</label>
                              <input
                                type="text"
                                placeholder="Last Name *"
                                value={p.lastName}
                                onChange={(e) => {
                                  const updated = [...passengerDetails];
                                  updated[idx].lastName = e.target.value;
                                  setPassengerDetails(updated);
                                }}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-field">
                              <label>Contact Number</label>
                              <input
                                type="tel"
                                placeholder="09XX XXX XXXX"
                                value={formatPhoneNumber(p.contactNumber || '')}
                                onChange={(e) => handlePhoneNumberChange(idx, e.target.value)}
                                className={p.contactNumber && !validatePhilippinePhoneNumber(p.contactNumber) ? 'error' : ''}
                                required
                              />
                              {p.contactNumber && !validatePhilippinePhoneNumber(p.contactNumber) && (
                                <small className="error-text">Please enter a valid Philippine phone number</small>
                              )}
                            </div>
                            <div className="form-field">
                              <label>Birthday</label>
                              <input
                                type="date"
                                value={p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const today = new Date();
                                    const birthDate = new Date(e.target.value);
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const m = today.getMonth() - birthDate.getMonth();
                                    if (m < 0 || (m === 0) && today.getDate() < birthDate.getDate()) age--;
                                    let fareCat;
                                    if (age >= 8 && age <= 59) {
                                      fareCat = (fareCategories && fareCategories.length > 0) ? fareCategories.find((c) => c.type && c.type.toLowerCase().includes('regular')) || fareCategories[0] : { _id: 'adult_fare', price: 470 };
                                    } else {
                                      fareCat = (fareCategories || []).find((cat) => age >= (cat.minAge ?? 0) && (cat.maxAge === null || age <= (cat.maxAge ?? age))) || (fareCategories[0] || { _id: 'default', price: 470 });
                                    }
                                    const updated = [...passengerDetails];
                                    updated[idx].birthday = e.target.value;
                                    updated[idx].fareCategory = fareCat?._id ?? updated[idx].fareCategory;
                                    updated[idx].fareAmount = fareCat?.price ?? updated[idx].fareAmount ?? 470;
                                    setPassengerDetails(updated);
                                  }
                                }}
                                max={new Date().toISOString().split('T')[0]}
                                className="compact-date-input"
                                placeholder="YYYY-MM-DD"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-field">
                            <label>Fare Category</label>
                            <select
                              value={p.fareCategory}
                              onChange={(e) => {
                                const selectedCat = (fareCategories || []).find((cat) => cat._id === e.target.value);
                                const updated = [...passengerDetails];
                                updated[idx].fareCategory = e.target.value;
                                updated[idx].fareAmount = selectedCat ? selectedCat.price : updated[idx].fareAmount ?? 470;
                                setPassengerDetails(updated);
                              }}
                              required
                            >
                              {(() => {
                                if (p.birthday) {
                                  const today = new Date();
                                  const birthDate = new Date(p.birthday);
                                  let age = today.getFullYear() - birthDate.getFullYear();
                                  const m = today.getMonth() - birthDate.getMonth();
                                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                  
                                  const options = [];
                                  
                                  // PWD option is available for all ages
                                  options.push(<option key="pwd_fare" value="pwd_fare">PWD Fare</option>);
                                  
                                  if (age >= 8 && age <= 59) {
                                    options.push(
                                      <option key="student_fare" value="student_fare">Student Fare</option>,
                                      <option key="adult_fare" value="adult_fare">Regular Fare</option>
                                    );
                                  } else {
                                    // Find appropriate fare category based on age
                                    const fareCat = (fareCategories || []).find((cat) => 
                                      cat._id !== 'pwd_fare' && // Exclude PWD since it's already added
                                      age >= (cat.minAge ?? 0) && (cat.maxAge === null || age <= (cat.maxAge ?? age))
                                    );
                                    if (fareCat) {
                                      options.push(<option key={fareCat._id} value={fareCat._id}>{fareCat.type ?? fareCat.name}</option>);
                                    }
                                  }
                                  
                                  return options;
                                }
                                return <option value="">Select Fare Category</option>;
                              })()}
                            </select>
                          </div>
                          
                          {(p.fareCategory === 'student_fare' || p.fareCategory === 'senior_fare' || p.fareCategory === 'pwd_fare') && (
                            <div className="form-field">
                              <label>ID Number</label>
                              <input
                                type="text"
                                placeholder="Student/Senior/PWD ID Number"
                                value={p.idNumber || ''}
                                onChange={(e) => {
                                  const updated = [...passengerDetails];
                                  updated[idx].idNumber = e.target.value;
                                  setPassengerDetails(updated);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => setPassengerDetails([...passengerDetails, { firstName: '', lastName: '', birthday: null, fareCategory: '', fareAmount: 470, contactNumber: '', idNumber: '' }])}
                      >
                        <i className="bx bx-plus"></i>
                        Add Passenger
                      </button>
                    </div>
                  </div>

                  <div className="form-separator"></div>

                  {/* Vehicle Section */}
                  <div className="field-section">
                    <div className="section-header">
                      <h4 className="section-title">Vehicle Details</h4>
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
                    </div>

                    {formData.hasVehicle && (
                      <div className="details-container">
                        {vehicleDetails.map((v, idx) => (
                          <div key={idx} className="detail-card">
                            <div className="card-header">
                              <span>Vehicle {idx + 1}</span>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  className="delete-btn"
                                  onClick={() => removeVehicleDetail(idx)}
                                >
                                  <i className="bx bx-x"></i>
                                </button>
                              )}
                            </div>
                            
                            <div className="form-row">
                              <div className="form-field">
                                <label>Vehicle Type</label>
                                <select
                                  value={v.vehicleType}
                                  onChange={(e) => updateVehicleDetail(idx, 'vehicleType', e.target.value)}
                                  required
                                >
                                  <option value="">Select Vehicle Type</option>
                                  {vehicleTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {v.vehicleType && (
                                <div className="form-field">
                                  <label>Select Vehicle</label>
                                  <select
                                    value={v.vehicleSelect || ''}
                                    onChange={(e) => updateVehicleDetail(idx, 'vehicleSelect', e.target.value)}
                                    required
                                  >
                                    <option value="">Select Vehicle</option>
                                    {getFilteredVehiclesForType(v.vehicleType).map((vehicle) => (
                                      <option key={vehicle._id} value={vehicle._id}>{vehicle.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            <div className="form-field">
                              <label>Plate Number</label>
                              <input
                                type="text"
                                placeholder="Plate Number *"
                                value={v.plateNumber}
                                onChange={(e) => updateVehicleDetail(idx, 'plateNumber', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          className="add-btn"
                          onClick={addVehicleDetail}
                        >
                          <i className="bx bx-plus"></i>
                          Add Vehicle
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment Summary */}
                <div className="right-column">
                  <div className="payment-summary">
                    <h4>Payment Summary</h4>
                    <div className="summary-line">
                      <span>Passenger Fare:</span>
                      <span>₱{(passengerDetails.length === 1 && !passengerDetails[0].birthday ? 0 : passengerDetails.reduce((sum, p) => sum + (p.fareAmount || 0), 0)).toLocaleString()}</span>
                    </div>
                    {formData.hasVehicle && (
                      <div className="summary-line">
                        <span>Vehicle Fare:</span>
                        <span>₱{totalVehicleFare.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="summary-line total">
                      <span>Total Amount:</span>
                      <span>₱{(
                        (passengerDetails.length === 1 && !passengerDetails[0].birthday ? 0 : passengerDetails.reduce((sum, p) => sum + (p.fareAmount || 0), 0)) +
                        (formData.hasVehicle ? totalVehicleFare : 0)
                      ).toLocaleString()}</span>
                    </div>
                    <div className="summary-line payment-method">
                      <span>Payment Method:</span>
                      <span>Card</span>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => { setPopupOpen(false); resetBookingForm(); }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="submit-btn"
                      onClick={handleAddOrUpdate}
                    >
                      {isEditing ? 'Update Booking' : 'Add Booking'}
                    </button>
                  </div>
                </div>
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