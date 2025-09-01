import React, { useState, useEffect } from "react";
import { getAboutAppContent, updateAboutAppContent } from '../../services/ApiEndpoint'; 
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';

const EditAboutApp = () => {
  const [aboutText, setAboutText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch current about content
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching about app content...');
        
        const response = await getAboutAppContent();
        console.log('Response received:', response);
        
        // Handle the response data properly
        const data = response.data || response;
        setAboutText(data.aboutText || "");
        
        console.log('About text set to:', data.aboutText);
      } catch (err) {
        console.error('Error fetching about app content:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        setError(`Failed to load About App content: ${err.response?.data?.message || err.message}`);
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!aboutText.trim()) {
      setError("About text cannot be empty");
      toast.error('About text cannot be empty');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Saving about app content:', { aboutText });
      
      const response = await updateAboutAppContent({ aboutText });
      console.log('Save response:', response);
      
      setSuccess(true);
      toast.success('About App content saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving about app content:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to save About App content: ${errorMessage}`);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-page">
      <h1 className="page-title">Edit About App</h1>
      <div className="edit-page-container">
        
        {loading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSave} className="edit-form">
          <div className="form-group">
            <label className="form-label" htmlFor="aboutText">About App Content:</label>
            <textarea
              id="aboutText"
              name="aboutText"
              className="form-textarea textarea-large"
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Enter the about app content here..."
              disabled={saving}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={saving || !aboutText.trim()}
            className={`submit-button ${(saving || !aboutText.trim()) ? 'disabled' : ''}`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <p style={{ color: "red" }}>{error}</p>
          </div>
        )}
        
        {/* {success && (
          <div className="success-message">
            <p style={{ color: "green" }}>About App content saved successfully!</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EditAboutApp;