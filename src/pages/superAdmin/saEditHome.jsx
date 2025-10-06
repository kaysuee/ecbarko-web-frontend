import React, { useEffect, useState } from 'react';
import { getHomeContent, updateHomeContent } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';
import c4Edit from '../../assets/imgs/c4.png'
import c5Edit from '../../assets/imgs/c5.png'

function EditHome() {
    const [isLoading, setIsLoading] = useState(false);

  const [homeTestimonial, setHomeTestimonial] = useState([
    { name: '', testimonial: '', image: '' },
    { name: '', testimonial: '', image: '' },
    { name: '', testimonial: '', image: '' },
    { name: '', testimonial: '', image: '' },
    { name: '', testimonial: '', image: '' },
  ]);

  const [homeFAQs, setHomeFAQs] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await getHomeContent();
      const data = res.data;

      setHomeTestimonial(
        data.homeTestimonial?.length === 5
          ? data.homeTestimonial
          : [
                { name: '', testimonial: '', image: '' },
                { name: '', testimonial: '', image: '' },
                { name: '', testimonial: '', image: '' },
                { name: '', testimonial: '', image: '' },
                { name: '', testimonial: '', image: '' },
            ]
      );
      
      setHomeFAQs(
        data.homeFAQs?.length > 0
          ? data.homeFAQs
          : [
                { question: '', answer: '' },
                { question: '', answer: '' },
                { question: '', answer: '' },
                { question: '', answer: '' },
            ]
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialChange = (index, field, value) => {
    const updatedTestimonial = [...homeTestimonial];
    updatedTestimonial[index][field] = value;
    setHomeTestimonial(updatedTestimonial);
  };

  const handleFAQChange = (index, field, value) => {
    const updatedFAQs = [...homeFAQs];
    updatedFAQs[index][field] = value;
    setHomeFAQs(updatedFAQs);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Log what we're sending to the API
    console.log("Sending data to API:", { homeTestimonial, homeFAQs });
    
    const response = await updateHomeContent({
      homeTestimonial,
      homeFAQs,
    });
    
    console.log("Update response:", response);
    toast.success('Home content updated successfully!');
    fetchContent();
  } catch (err) {
    // More detailed error logging
    console.error("Error details:", {
      message: err.message,
      responseData: err.response?.data,
      status: err.response?.status,
      fullError: err
    });
    
    toast.error(`Failed to update: ${err.response?.data?.message || err.message || 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="edit-page" style={{ paddingTop: '10px', marginTop: '0' }}>
      <h1 className="page-title">Edit Homepage</h1>
      <div className="edit-page-container">
        
        {isLoading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSubmit} className="edit-form">

          <h3 className="section-title">Testimonials:</h3>
          <img src={c4Edit} alt="" style={{height: '320px', width: '550px', alignSelf: 'center',}}  />
          {homeTestimonial.map((user, index) => (
            <div key={index} className="team-member-card">
              <div className="form-group-inline">
                <label className="form-label-small">Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.name}
                  onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-inline">
                <label className="form-label-small">Comment:</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.testimonial}
                  onChange={(e) => handleTestimonialChange(index, 'testimonial', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-inline">
                <label className="form-label-small">Image URL:</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.image}
                  onChange={(e) => handleTestimonialChange(index, 'image', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}

          <h3 className="section-title">FAQs:</h3>
          <img src={c5Edit} alt="" style={{height: '300px', width: '550px', alignSelf: 'center'}}  />
          {homeFAQs.map((faq, index) => (
            <div key={index} className="team-member-card">
              <div className="form-group-inline">
                <label className="form-label-small">Question:</label>
                <input
                  type="text"
                  className="form-input"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-inline">
                <label className="form-label-small">Answer:</label>
                <textarea
                  className="form-input form-textarea"
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                  disabled={isLoading}
                  rows="3"
                />
              </div>
            </div>
          ))}

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

export default EditHome;