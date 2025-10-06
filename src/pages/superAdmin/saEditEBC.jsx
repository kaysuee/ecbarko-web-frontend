import React, { useEffect, useState } from 'react';
import { getAboutEBCContent, updateAboutEBCContent } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';
import editIntro from '../../assets/imgs/edit-intro.png'
import c7Edit from '../../assets/imgs/c7.png'
import c8Edit from '../../assets/imgs/c8.png'


function EditAboutEBC() {
  const [aboutEBCTextSection, setAboutEBCTextSection] = useState('');
  const [aboutEBCAddress, setAboutEBCAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await getAboutEBCContent();
      const data = res.data;

      setAboutEBCTextSection(data.aboutEBCTextSection || '');
      setAboutEBCAddress(data.aboutEBCAddress || '');
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
      await updateAboutEBCContent({
        aboutEBCTextSection,
        aboutEBCAddress
      });
      toast.success('About EcBarko Card content updated successfully!');
      fetchContent();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-page" style={{ paddingTop: '10px', marginTop: '0' }}>
      <h1 className="page-title">Edit About EcBarko Card</h1>
      <div className="edit-page-container">
        
        {isLoading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label className="form-label">About Card:</label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={c7Edit} alt="edit intro image" style={{ marginBottom: '30px', height: '300px' }} />
            </div>
            <textarea
              className="form-textarea"
              value={aboutEBCTextSection}
              onChange={(e) => setAboutEBCTextSection(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Address:</label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={c8Edit} alt="edit intro image" style={{ marginBottom: '30px', height: '300px'  }} />
            </div>
            <textarea
              className="form-textarea"
              value={aboutEBCAddress}
              onChange={(e) => setAboutEBCAddress(e.target.value)}
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

export default EditAboutEBC;