import React, { useState, useEffect } from "react";
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../../services/ApiEndpoint'; 
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';
import '../../styles/Announcement.css';
import mb from '../../assets/imgs/mbFaqs.png'

const EditFaqs = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: '',
    isActive: true
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'payment', label: 'Payment' },
    { value: 'booking', label: 'Booking' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'account', label: 'Account' },
    { value: 'support', label: 'Support' }
  ];

  // Fetch FAQs
  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching FAQs...');
      
      const response = await getFaqs();
      console.log('Response received:', response);
      
      const data = response.data || response;
      setFaqs(data.faqs || []);
      
      console.log('FAQs loaded:', data.faqs?.length || 0);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(`Failed to load FAQs: ${err.response?.data?.message || err.message}`);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      order: '',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // Handle add new FAQ
  const handleAddFaq = () => {
    resetForm();
    setShowAddForm(true);
  };

  // Handle edit FAQ
  const handleEditFaq = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order.toString(),
      isActive: faq.isActive
    });
    setEditingId(faq._id);
    setShowAddForm(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError("Question and answer cannot be empty");
      toast.error('Question and answer are required');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = {
        ...formData,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: formData.order ? parseInt(formData.order) : undefined
      };

      console.log('Submitting FAQ:', submitData);
      
      let response;
      if (editingId) {
        response = await updateFaq(editingId, submitData);
        console.log('Update response:', response);
        toast.success('FAQ updated successfully!');
      } else {
        response = await createFaq(submitData);
        console.log('Create response:', response);
        toast.success('FAQ created successfully!');
      }
      
      setSuccess(true);
      resetForm();
      await fetchFaqs(); 
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving FAQ:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to save FAQ: ${errorMessage}`);
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete FAQ
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteId(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeleteFaq = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deleteFaq(deleteId);
      toast.success('FAQ deleted successfully!');
      await fetchFaqs();
      closeDeleteConfirm();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to delete FAQ: ${errorMessage}`);
      toast.error('Failed to delete FAQ');
      closeDeleteConfirm();
    } finally {
      setSaving(false);
    }
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="edit-page" style={{ paddingTop: '10px', marginTop: '0' }}>
      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content delete-confirmation">
            <div className="delete-icon">
              <i className="bx bx-trash" style={{ fontSize: '36px', color: '#e74c3c' }}></i>
            </div>
            <h3>Delete FAQ</h3>
            <p>Are you sure you want to delete this FAQ? This action cannot be undone.</p>
            <div className="popup-actions">
              <button onClick={closeDeleteConfirm} className="cancel-btn">Cancel</button>
              <button onClick={confirmDeleteFaq} className="delete-confirm-btn" disabled={saving}>
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="page-title">Edit FAQs</h1>
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleAddFaq}
            className="btn-download"
            disabled={saving}
            style={{ fontSize: "16px" }}
          >
            Add New FAQ
          </button>
        </div>
      <div className="edit-page-container">
        
        {loading && <div className="loading-text">Loading...</div>}
        
        

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={{ marginBottom: '30px', border: '2px solid #013986', borderRadius: '8px', padding: '20px' }}>
            <h2 className="section-title">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <img src={mb} alt="" style={{height: '300px', width: '360px', display: "block", margin: "0 auto", marginBottom: '20px'}}  />
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category:</label>
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="question">Question:</label>
                <input
                  id="question"
                  name="question"
                  type="text"
                  className="form-input"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Enter the question..."
                  disabled={saving}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="answer">Answer:</label>
                <textarea
                  id="answer"
                  name="answer"
                  className="form-textarea textarea-large"
                  value={formData.answer}
                  onChange={handleInputChange}
                  placeholder="Enter the answer..."
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="order">Order (optional):</label>
                <input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Display order (leave empty for auto)"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  Active
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={saving || !formData.question.trim() || !formData.answer.trim()}
                  className={`submit-button ${(saving || !formData.question.trim() || !formData.answer.trim()) ? 'disabled' : ''}`}
                >
                  {saving ? "Saving..." : (editingId ? "Update FAQ" : "Create FAQ")}
                </button>
                
                <button 
                  type="button" 
                  onClick={resetForm}
                  disabled={saving}
                  className="submit-button"
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQs List */}
        <div>
          <div className="ann-head">
            <h3>Existing FAQs ({faqs.length})</h3>
          </div>

          {Object.keys(groupedFaqs).length === 0 && !loading ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No FAQs found.</p>
          ) : (
            Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  color: '#013986', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  marginBottom: '15px',
                  textTransform: 'capitalize'
                }}>
                  {category} ({categoryFaqs.length})
                </h3>
                
                {categoryFaqs.map((faq) => (
                  <div 
                    key={faq._id} 
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: faq.isActive ? '#ffffff' : '#f8f9fa'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '10px' 
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          marginBottom: '8px' 
                        }}>
                          <strong style={{ color: '#013986' }}>Q{faq.order}:</strong>
                          {!faq.isActive && (
                            <span style={{ 
                              backgroundColor: '#dc3545', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '12px' 
                            }}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <div style={{ marginBottom: '10px', fontWeight: '500' }}>
                          {faq.question}
                        </div>
                        <div style={{ color: '#666', lineHeight: '1.5' }}>
                          {faq.answer}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginLeft: '15px' 
                      }}>
                        <button
                          onClick={() => handleEditFaq(faq)}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(faq._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#999', 
                      borderTop: '1px solid #eee', 
                      paddingTop: '8px' 
                    }}>
                      Updated: {new Date(faq.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p style={{ color: "red" }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditFaqs;