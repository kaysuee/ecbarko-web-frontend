import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { getContactContent } from '../../services/ApiEndpoint';
import { sendContactMessage } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import '../../styles/Contact.css';
import alogo from '../../assets/imgs/white.png'
import alogodark from '../../assets/imgs/logoblue.png'
import { FaPhone, FaEnvelope } from 'react-icons/fa'
import Footer from '../../components/guest/footer.jsx'

function Contact() {
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Form state matching the custom field names
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cMessage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);
    
  const fetchContent = async () => {
    try {
      const res = await getContactContent();
      const data = res.data;
      setContactNumber(data.contactNumber || '');
      setContactEmail(data.contactEmail || '');
    } catch (err) {
      console.error(err);
    }
  };

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map form data to the expected API format
      const messageData = {
        name: formData.name,
        email: formData.email,
        message: formData.cMessage // Convert cMessage to message for the API
      };
      
      // Call the API to send email
      await sendContactMessage(messageData);
      
      // Show success message
      toast.success('Your message has been sent successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        cMessage: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      <header className="header" id="header">
        <div className="header-content">
          <img id="logo" src={alogo} alt="logo" />
          <nav className="nav">
            <div className="navLinks">
              <Link to="/" className="navLink">home</Link>
              <Link to="/about" className="navLink">about</Link>
              <Link to="/contact" className="activeNavLink">contact us</Link>
              <Link to="/login?" className="navLink">login</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="contact-us">
        <div className="contact-us-title">
          <h1>Contact <span>Us</span></h1>
          <p>Have questions about EcBarko? Need help with your ferry booking or EcBarko card? <br />
            Our support team is here to assist you with any inquiries about our services <br /> and ensure 
            your travel experience is smooth and hassle-free.</p>
        </div>
      </div>

      <div className="contactInfo">
        <div className="phoneNum">
          <a href={`tel:${contactNumber}`} aria-label="cPhone">
            <div className="phoneContent">
              <FaPhone className="cPhone" />
              <span>{contactNumber}</span>
            </div>
          </a>
        </div>
        <div className="cEmail">
          <a href={`mailto:${contactEmail}`} aria-label="cMail">
            <div className="emailContent">
              <FaEnvelope className="cMail" />
              <span>{contactEmail}</span>
            </div>
          </a>
        </div>
      </div>

      <div className="frm-maps">
        <div className="cMaps">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.884274997654!2d121.61811847473881!3d13.905864686502284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd4b034875f611%3A0xf8ca661c4e533b45!2sPort%20of%20Lucena!5e0!3m2!1sen!2sph!4v1745502807799!5m2!1sen!2sph" 
            width="600" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Map of Port of Lucena"
          ></iframe>
        </div>

        <div className="cForm-bg">
          <div className="cForm">
            <form onSubmit={handleSubmit} className="contact-left">
              <div className="contact-left-title">
                <h2>Send Us a Message</h2>
              </div>
              <input 
                type="cText" 
                name="name" 
                placeholder="Your Name" 
                className="contact-inputs" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="cEmail" 
                name="email" 
                placeholder="Your Email" 
                className="contact-inputs" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
              <textarea 
                name="cMessage" 
                placeholder="Your Message" 
                className="contact-inputs" 
                value={formData.cMessage}
                onChange={handleInputChange}
                required
              ></textarea>
              <button 
                type="cSubmit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default Contact