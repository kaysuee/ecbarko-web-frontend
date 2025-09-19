import React, { useEffect, useState } from 'react';
import { getAboutContent, updateAboutContent } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';

function EditPage() {
  const [aboutContent, setAboutContent] = useState('');
  const [aboutIntro, setAboutIntro] = useState('');
  const [aboutTextSection, setAboutTextSection] = useState('');
  const [aboutVideoUrl, setAboutVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [aboutTeam, setAboutTeam] = useState([
    { name: '', role: '', image: '' },
    { name: '', role: '', image: '' },
    { name: '', role: '', image: '' },
    { name: '', role: '', image: '' },
  ]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await getAboutContent();
      const data = res.data;

      setAboutContent(data.aboutContent || '');
      setAboutIntro(data.aboutIntro || '');
      setAboutTextSection(data.aboutTextSection || '');
      setAboutVideoUrl(data.aboutVideoUrl || '');

      setAboutTeam(
        data.aboutTeam?.length === 4
          ? data.aboutTeam
          : [
              { name: '', role: '', image: '' },
              { name: '', role: '', image: '' },
              { name: '', role: '', image: '' },
              { name: '', role: '', image: '' },
            ]
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamChange = (index, field, value) => {
    const updatedTeam = [...aboutTeam];
    updatedTeam[index][field] = value;
    setAboutTeam(updatedTeam);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateAboutContent({
        aboutContent,
        aboutIntro,
        aboutTextSection,
        aboutVideoUrl,
        aboutTeam,
      });
      toast.success('About content updated successfully!');
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
      <div className="edit-page-container">
        <h2 className="page-title">Edit About Us</h2>
        
        {isLoading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label className="form-label">First container content:</label>
            <textarea
              className="form-textarea"
              value={aboutContent}
              onChange={(e) => setAboutContent(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Intro (below About Us title):</label>
            <textarea
              className="form-textarea textarea-small"
              value={aboutIntro}
              onChange={(e) => setAboutIntro(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Text Section (below images):</label>
            <textarea
              className="form-textarea textarea-large"
              value={aboutTextSection}
              onChange={(e) => setAboutTextSection(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Video URL (YouTube Embed URL):</label>
            <input
              type="text"
              className="form-input"
              value={aboutVideoUrl}
              onChange={(e) => setAboutVideoUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <h3 className="section-title">Team Members:</h3>
          {aboutTeam.map((member, index) => (
            <div key={index} className="team-member-card">
              <div className="form-group-inline">
                <label className="form-label-small">Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={member.name}
                  onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-inline">
                <label className="form-label-small">Role:</label>
                <input
                  type="text"
                  className="form-input"
                  value={member.role}
                  onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-inline">
                <label className="form-label-small">Image URL:</label>
                <input
                  type="text"
                  className="form-input"
                  value={member.image}
                  onChange={(e) => handleTeamChange(index, 'image', e.target.value)}
                  disabled={isLoading}
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

export default EditPage;