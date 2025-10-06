import React, { useEffect, useRef, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectFade } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';  
import '../../styles/Ecf.css';
import { getAboutEBCContent } from '../../services/ApiEndpoint';

import ecbplogodark from '../../assets/imgs/logoblue.png';
import ebcp from '../../assets/imgs/ebcp-bg.png';
import ctype1 from '../../assets/imgs/Type1.png';
import ctype2 from '../../assets/imgs/Type2.png';
import ctype3 from '../../assets/imgs/Type3.png';
import ctype4 from '../../assets/imgs/Type4.png';
import ecbpImg from '../../assets/imgs/ecbpImg.png';
import setUp from '../../assets/imgs/setUp.png';
import Footer from '../../components/guest/footer.jsx'

function EcBarkoCardFAQs() {
  const [aboutEBCTextSection, setAboutEBCTextSection] = useState('');
  const [aboutEBCAddress, setAboutEBCAddress] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
  const swiperRef = useRef(null);

  const fetchContent = async () => {
    try {
      const res = await getAboutEBCContent();
      const data = res.data;
      setAboutEBCTextSection(data.aboutEBCTextSection || ''); 
      setAboutEBCAddress(data.aboutEBCAddress || ''); 
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContent(); 
    
    const handleScroll = () => {
      const header = document.getElementById('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-btn') && !event.target.closest('.navLinks')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const scrollToCards = () => {
    const cardsContainer = document.querySelector('.ecbp-card');
    if (cardsContainer) {
      cardsContainer.scrollIntoView({ behavior: 'smooth' });
      
      setTimeout(() => {
        window.scrollBy(0, 0); 
      }, 500); 
    }
  };

  const scrollToLocation = () => {
    const wtbContainer = document.querySelector('.wtb-cards');
    if (wtbContainer) {
      wtbContainer.scrollIntoView({ behavior: 'smooth' });
      
      setTimeout(() => {
        window.scrollBy(0, 130); 
      }, 500);
    }
  };

  const slidePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const slideNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="ecbarko-card-faqs">
      <header className="header" id="header">
        <div className="header-content">
          <img src={ecbplogodark} alt="logo" id="logo" /> 
          {/* Mobile menu hamburger button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className="nav">
            <div className={`navLinks ${mobileMenuOpen ? 'nav-open' : ''}`}>
              <Link to="/" className="navLink" onClick={() => setMobileMenuOpen(false)}>home</Link>
              <Link to="/about" className="navLink" onClick={() => setMobileMenuOpen(false)}>about</Link>
              <Link to="/contact" className="navLink" onClick={() => setMobileMenuOpen(false)}>contact us</Link>
              <Link to="/login?" className="navLink" onClick={() => setMobileMenuOpen(false)}>login</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="ecbp-image-container">
        <img src={ebcp} alt="background" />
        <div className="ecbp-title">
          <h1><span>Ec</span>Barko Card</h1>
          <button className="ecbp-view" onClick={scrollToCards}>View Card</button>
        </div>
      </div>

      <div className="ecbp-card">
        <div className="ecdp-card-heading">
          <h1><span>Ec</span>Barko</h1>
          <h1>Card</h1>
          <p>{aboutEBCTextSection} </p>
          <button className="ecbp-buyNow" onClick={scrollToLocation}>Buy Now</button>
        </div>
        <div className="ecbp-cardImg">
          <img src={ecbpImg} alt="card image" />
        </div>
      </div>

      <div className="ecbp-cards-container">
        <div className="card-types">
          <div className="ecbp-swiper-custom-buttons">
            <button className="ecbp-swiper-button-prev-custom" onClick={slidePrev}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="ecbp-swiper-button-next-custom" onClick={slideNext}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <Swiper
            ref={swiperRef}
            spaceBetween={30}
            slidesPerView={1}
            effect="fade"  
            modules={[Navigation, EffectFade]} 
            navigation={false}
            loop={true}
            fadeEffect={{
              crossFade: true, 
            }}
          >
            <SwiperSlide className="card-type">
              <div className="cardT-container">
                <div className="cardT-left">
                  <img src={ctype1} alt="Type 1" />
                </div>
                <div className="cardT-right">
                  <h2 className="cardT-title">TYPE 1</h2>
                  <p className="cardT-description">1 - 3 Lane Meter<br />Bicycle, Bicycle with Sidecar,<br/> Motorcycle, Motorcycle with Sidebar </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="card-type">
              <div className="cardT-container">
                <div className="cardT-left">
                  <img src={ctype2} alt="Type 2" />
                </div>
                <div className="cardT-right">
                  <h2 className="cardT-title">TYPE 2</h2>
                  <p className="cardT-description">3 - 5 Lane Meter <br />Compact / Midsize Sedan, Hatchback, Large Van,<br />MVP - 7 Seater, MVP - Small, Mini SUV, Mini Truck, etc. </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="card-type">
              <div className="cardT-container">
                <div className="cardT-left">
                  <img src={ctype3} alt="Type 3" />
                </div>
                <div className="cardT-right">
                  <h2  className="cardT-title">TYPE 3</h2>
                  <p className="cardT-description">5 - 7 Lane Meter <br />Full Size Van, Large SUV, Light Truck, <br />Medium Track - 6 Wheeler, Pickup - Double Cab, etc. </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="card-type">
              <div className="cardT-container">
                <div className="cardT-left">
                  <img src={ctype4} alt="Type 4" />
                </div>
                <div className="cardT-right">
                  <h2 className="cardT-title">TYPE 4</h2>
                  <p className="cardT-description">7 - Up Lane Meter <br />10 - Wheeler Truck Long Bed, 12 - Wheeler Truck, <br />14 - Wheeler Truck, Articulated Trailer, etc. </p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <div className="wtb-cards">
        <h1>Where to buy?</h1>
        <div className="pinned-loc">
          <div className="ebcp-maps">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.884274997654!2d121.61811847473881!3d13.905864686502284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd4b034875f611%3A0xf8ca661c4e533b45!2sPort%20of%20Lucena!5e0!3m2!1sen!2sph!4v1745502807799!5m2!1sen!2sph" 
                width="600" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="ecbp-text">
            <div className="ecbp-divider"></div>
            <div className="ecbp-txt-side">
                <p>{aboutEBCAddress} </p>
            </div>
          </div>
        </div>
      </div>

      <div className="ecbp-setup">
        <h1>How to setup?</h1>
        <div className="ecbp-setup-container">
          <div className="setup-one-two">
            <div className="setup-one">
              <div className="setup-text">
                <img src="https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/942817be455709a97ad03b692dca7a6c2fdfc934?placeholderIfAbsent=true" alt="number 1" />
                <p>Download EcBarko Mobile Application.</p>
              </div>
              <div className="ecbp-dl">
                <div className="ecbp-playStore">
                  <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/fca0dcccb291985d7f8d25511c2a0839e6d5db92" alt="Play Store" />
                </div>
                <div className="ecbp-appStore">
                  <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/0f8acb388f22d934afce78e2cf9a29d9131e9895" alt="App Store" />
                </div>
              </div>
            </div>

            <div className="setup-two">
              <div className="setup-text">
                <img src="https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/050d8b109d0cb45e0f874b4cd1f4a98b49e64595?placeholderIfAbsent=true" alt="number 2" />
                <p>Sign Up or Log in.</p>
              </div>
              <div className="setup-signup-login">
                <img src="https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/34978ba8b0849a9b5e636c10204f3243006c78b4?placeholderIfAbsent=true" alt="app-ss" />
              </div>
            </div>
          </div>

          <div className="setup-3-4-5">
            <div className="setup-three">
                <div className="setup-text">
                  <img src="https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/f6a7f52df744470c88c8df6fc613a221f23ed1ee?placeholderIfAbsent=true" alt="number 3" />
                  <p>Input your EcBarko Card Number in Wallet.</p>
                </div>
            </div>

            <div className="setup-four">
                <div className="setup-text">
                  <img src={"https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/54dbcd58b1a74d4601f9c9eb8e1282149d9c128c?placeholderIfAbsent=true"} alt="number 4" />
                  <p>Easily load your card using the app!</p>
                </div>
            </div>

            <div className="setup-five">
              <div className="setup-text">
                <img src="https://cdn.builder.io/api/v1/image/assets/fa3b173249ae44949a107c68d9ad466c/d3ca7d36188923d485517eb0d917cb42e9b52a43?placeholderIfAbsent=true" alt="number 5" />
                <p>You can load and use your EcBarko Card anytime!</p>
              </div>
              <div className="setup-signup-login">
                <img src={setUp} alt="app-ss" />
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default EcBarkoCardFAQs;