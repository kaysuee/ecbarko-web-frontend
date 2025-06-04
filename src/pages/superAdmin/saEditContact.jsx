import React, { useEffect, useState } from 'react';
import { getContactContent, updateContactContent } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';
import c6Edit from '../../assets/imgs/c6.png'

function EditContact() {
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await getContactContent();
      const data = res.data;

      setContactNumber(data.contactNumber || '');
      setContactEmail(data.contactEmail || '');

    } catch (err) {
      console.error(err);
      toast.error('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateContactContent({
        contactNumber,
        contactEmail,
      });
      toast.success('Contact content updated successfully!');
      fetchContent();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-page">
      <h1 className="page-title">Edit Contact Us</h1>
      <div className="edit-page-container">
        
        {isLoading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <img src={c6Edit} alt="" style={{height: '150px', width: '580px', alignSelf: 'center', marginBottom: '30px'}}  />
          <div className="form-group">
            <label className="form-label">Phone Number:</label>
            {/* <img src={editIntro} alt="edit intro image" /> */}
            <textarea
              className="form-input"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Email:</label>
            {/* <img src={editIntro} alt="edit intro image" /> */}
            <textarea
              className="form-input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'disabled' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditContact;