import React, { useEffect, useState } from 'react';
import { getAboutContent, updateAboutContent } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/EditPage.css';
import editIntro from '../../assets/imgs/edit-intro.png'
import c1Edit from '../../assets/imgs/c1edit.png'
import c2Edit from '../../assets/imgs/c2.png'
import c3Edit from '../../assets/imgs/c3.png'

function EditAbout() {
  const [aboutContent, setAboutContent] = useState('');
  const [aboutIntro, setAboutIntro] = useState('');
  const [aboutTextSection, setAboutTextSection] = useState('');
  const [aboutTextSectionR, setAboutTextSectionR] = useState('');
  const [aboutVideoUrl, setAboutVideoUrl] = useState('');
  const [aboutVideoTitle, setAboutVideoTitle] = useState('');
  const [aboutVideoSideTextTitle, setAboutVideoSideTextTitle] = useState ('');
  const [aboutVideoSideText, setAboutVideoSideText] = useState ('');
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
      setAboutTextSectionR(data.aboutTextSectionR || '');
      setAboutVideoUrl(data.aboutVideoUrl || '');
      setAboutVideoTitle(data.aboutVideoTitle || '');
      setAboutVideoSideTextTitle(data.aboutVideoSideTextTitle || '');
      setAboutVideoSideText(data.aboutVideoSideText || '');

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
        aboutTextSectionR,
        aboutVideoUrl,
        aboutVideoTitle,
        aboutVideoSideTextTitle,
        aboutVideoSideText,
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
    <div className="edit-page" style={{ paddingTop: '10px', marginTop: '0' }}>
      <h1 className="page-title">Edit About Us</h1>
      <div className="edit-page-container">
        
        {isLoading && <div className="loading-text">Loading...</div>}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label className="form-label">Intro (below About Us title):</label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={editIntro} alt="edit intro image" style={{ marginBottom: '30px' }} />
            </div>
            <textarea
              className="form-textarea"
              value={aboutContent}
              onChange={(e) => setAboutContent(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <h3 className="section-title">First container content:</h3>
          <img src={c1Edit} alt="edit container 1" style={{height: '200px', width: '550px', alignSelf: 'center', marginBottom: '30px'}} />
          <div className="team-member-card">
            <div className="form-group">
              <label className="form-label">Heading:</label>
              <textarea
                className="form-textarea textarea-small"
                value={aboutIntro}
                onChange={(e) => setAboutIntro(e.target.value)}
                disabled={isLoading}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Text Section (Left Side):</label>
              <textarea
                className="form-textarea textarea-large"
                value={aboutTextSection}
                onChange={(e) => setAboutTextSection(e.target.value)}
                disabled={isLoading}
              ></textarea>
          </div>

           <div className="form-group">
            <label className="form-label">Text Section (Right Side):</label>
            <textarea
              className="form-textarea textarea-large"
              value={aboutTextSectionR}
              onChange={(e) => setAboutTextSectionR(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>
          </div>

          <h3 className="section-title">Second container content:</h3>
          <img src={c2Edit} alt="" style={{height: '300px', width: '550px', alignSelf: 'center', marginBottom: '30px'}}  />
          <div className="team-member-card">
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
            <div className="form-group">
              <label className="form-label">Video Title:</label>
              <input
                type="text"
                className="form-input"
                value={aboutVideoTitle}
                onChange={(e) => setAboutVideoTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subheading: </label>
              <textarea
                className="form-textarea textarea-small"
                value={aboutVideoSideTextTitle}
                onChange={(e) => setAboutVideoSideTextTitle(e.target.value)}
                disabled={isLoading}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Text: </label>
              <textarea
                className="form-textarea textarea-small"
                value={aboutVideoSideText}
                onChange={(e) => setAboutVideoSideText(e.target.value)}
                disabled={isLoading}
              ></textarea>
            </div>
          </div>




          <h3 className="section-title">Team Members:</h3>
           <img src={c3Edit} alt="" style={{height: '260px', width: '550px', alignSelf: 'center', marginBottom: '30px'}}  />
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

export default EditAbout;