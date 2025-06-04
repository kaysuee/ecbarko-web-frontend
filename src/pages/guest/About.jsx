import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import '../../styles/About.css';
import alogo from '../../assets/imgs/white.png';
import alogodark from '../../assets/imgs/logoblue.png';
import { getAboutContent } from '../../services/ApiEndpoint';

import sampleImg1 from '../../assets/imgs/sample-img1.png';
import sampleImg2 from '../../assets/imgs/sample-img2.png';
import sampleImg3 from '../../assets/imgs/sample-img3.jpg';
import sampleImg4 from '../../assets/imgs/sample-img4.jpg';

import Footer from '../../components/guest/footer.jsx';

function About() {
  const [aboutContent, setAboutContent] = useState('');
  const [aboutIntro, setAboutIntro] = useState('');
  const [aboutTextSection, setAboutTextSection] = useState('');
  const [aboutTextSectionR, setAboutTextSectionR] = useState('');
  const [aboutVideoUrl, setAboutVideoUrl] = useState('');
  const [aboutVideoTitle, setAboutVideoTitle] = useState('');
  const [aboutVideoSideTextTitle, setAboutVideoSideTextTitle] = useState ('');
  const [aboutVideoSideText, setAboutVideoSideText] = useState ('');
  const [aboutTeam, setAboutTeam] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('header');
      const logo = document.getElementById('logo');

      if (window.scrollY > 50) {
        header.classList.add('scrolled');
        if (logo) logo.src = alogodark;
      } else {
        header.classList.remove('scrolled');
        if (logo) logo.src = alogo;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
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
      setAboutTeam(data.aboutTeam || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="about-page">
      <header className="header" id="header">
        <div className="header-content">
          <img id="logo" src={alogo} alt="logo" />
          <nav className="nav">
            <div className="navLinks">
              <Link to="/" className="navLink">home</Link>
              <Link to="/about" className="activeNavLink">about</Link>
              <Link to="/contact" className="navLink">contact us</Link>
              <Link to="/login?" className="navLink">login</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="about-us">
        <div className="about-us-title">
          <h1>About <span>Us</span></h1>
          <p>{aboutContent}</p>
        </div>
        <div className="aimgs-container">
          <img className="simg1" src={sampleImg1} alt="img1" />
          <img className="simg2" src={sampleImg3} alt="img2" />
          <img className="simg3" src={sampleImg2} alt="img3" />
          <img className="simg4" src={sampleImg4} alt="img4" />
        </div>
      </div>

      <div className="atext-container">
        <h2>{aboutIntro}</h2>
        <div className="small-text">
          <div className="leftside-text">
            <p>{aboutTextSection}</p>
          </div>
          <div className="rightside-text">
            <p>{aboutTextSectionR}</p>
          </div>
        </div>
      </div>

      <div className="video-info">
        <div className="vid-container">
          <div className="vid">
            <iframe
              width="100%"
              height="350"
              src={aboutVideoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="vid-title">
            <p>{aboutVideoTitle}</p>
          </div>
        </div>
        <div className="vid-text">
          <h2>{aboutVideoSideTextTitle}</h2>
          <div className="dvd-txt">
            <div className="abtDivider"></div>
            <div className="txt-side">
              <p>{aboutVideoSideText} </p>
            </div>
          </div>
        </div>
      </div>

      <div className="team">
        <h1>Executive Officers</h1>
        <div className="team-container">
          {aboutTeam.map((member, index) => (
            <div className="team-member" key={index}>
              <div className="team-img">
                <img src={member.image || sampleImg1} alt={member.name} />
              </div>
              <div className="tinfo">
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
