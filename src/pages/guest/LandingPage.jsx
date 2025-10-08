import React, { useEffect, useState } from 'react';
import llogo from '../../assets/imgs/logoblue.png';
import img1 from '../../assets/imgs/ldpbg.png';
import profile from '../../assets/imgs/profile.png'
import quote from '../../assets/imgs/quote.png'
import app from '../../assets/imgs/landingpage-img.png'
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react'
import { getHomeContent, sendEmail } from '../../services/ApiEndpoint';
import { toast } from 'react-hot-toast'; 
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import '../../styles/Lp.css';
import Footer from '../../components/guest/footer.jsx'

function LandingPage() {
 const [homeTestimonial, setHomeTestimonial] = useState([]);
 const [homeFAQs, setHomeFAQs] = useState([]);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [email, setEmail] = useState('');
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  useEffect(() => {
     fetchContent();
   }, []);

 const fetchContent = async () => {
     try {
       const res = await getHomeContent();
       const data = res.data;
       setHomeTestimonial(data.homeTestimonial || []);
       setHomeFAQs(data.homeFAQs || []);
     } catch (err) {
       console.error(err);
     }
   };

 useEffect(() => {
   const handleScroll = () => {
     const header = document.getElementById('header');
     if (window.scrollY > 50) {
       header.classList.add('scrolled');
     } else {
       header.classList.remove('scrolled');
     }
   };

   window.addEventListener('scroll', handleScroll);

   return () => {
     window.removeEventListener('scroll', handleScroll);
   };
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

 const swiperRef = React.useRef(null);

 useEffect(() => {
   if (swiperRef.current) {
     const swiper = swiperRef.current.swiper;
     const prevButton = document.querySelector('.swiper-button-prev-custom');
     const nextButton = document.querySelector('.swiper-button-next-custom');

     prevButton.addEventListener('click', () => swiper.slidePrev());
     nextButton.addEventListener('click', () => swiper.slideNext());
   }
 }, []);

 const handleEmailChange = (e) => {
   setEmail(e.target.value);
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   
   if (!email) {
     toast.error('Please enter your email address');
     return;
   }
   
   setIsSubmitting(true);
   
   try {
     await sendEmail(email);
     toast.success('Thank you! An automatic confirmation has been sent to your email.');
     setEmail(''); 
   } catch (error) {
     console.error('Error sending email:', error);
     toast.error('Sorry, there was an error. Please try again later.');
   } finally {
     setIsSubmitting(false);
   }
 };

 const [popup, setPopup] = React.useState({ visible: false, question: '', answer: '' });

 const handlePopup = (question, answer) => {
   setPopup({ visible: true, question, answer });
 };

 const closePopup = () => {
   setPopup({ visible: false, question: '', answer: '' });
 };

 const toggleMobileMenu = () => {
   setMobileMenuOpen(!mobileMenuOpen);
 };


 return (
   <div className="landing-page">
     <header className="header" id="header">
       <div className="header-content">
         <img src={llogo} alt="logo" />
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
             <Link to="/" className="activeNavLink" onClick={() => setMobileMenuOpen(false)}>Home</Link>
             <Link to="/about" className="navLink" onClick={() => setMobileMenuOpen(false)}>About</Link>
             <Link to="/contact" className="navLink" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
             <Link to="/login" className="navLink" onClick={() => setMobileMenuOpen(false)}>Login</Link>
           </div>
         </nav>
       </div>
     </header>

     <div className="image-container">
       <img src={img1} alt="img bg" />
       <div className="tooltip-container">
         <div className="tooltip">
           <p className="tooltiptext"> Click to learn how to get <br /> the <span>EcBarko Card.</span> </p>
           <h1>
           <Link to="/EcBarkoCardFAQs" className="FAQs"> Hover <br />
             Over Me</Link>
           </h1>
         </div>
       </div>
     </div>

     <div className="container1">
       <div className="app-img">
         <img src={app} alt="Mobile App" />
       </div>
       <div className="app-info">
         <div className="app-info-text">
           <h1>Ec<span>Barko</span></h1>
           <p>Your complete ferry travel companion for seamless journeys from Lucena Port. 
            Experience hassle-free booking, smart card management, 
            and real-time schedules all in one powerful app designed for modern travelers.</p>
         </div>

         <div className="download">
           {/* <div className="playStore">
             <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/fca0dcccb291985d7f8d25511c2a0839e6d5db92" alt="Play Store" />
           </div> */}
           <div className="appStore">
            <a 
              href="https://drive.google.com/drive/folders/1s0cmLZrybboGwoYT_EP3ZTM_H5BVj3kP?fbclid=IwY2xjawNRmRlleHRuA2FlbQIxMQABHgxtD9p7T_HtNrVCQ89bUfV7Wkgyc-iSmIAHFTjrk0AAG8QjqApXr_rsp7SZ_aem_dmEa8OLsy3uaHSAkkzRljQ" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2F6ca8a2e3103e41d4a67177ce7e3020b0%2Fc45020660ef14454b557e66c551debd7?format=webp&width=800" 
                alt="App Store" 
              />
            </a>
            {/* <img src="https://cdn.builder.io/api/v1/image/assets%2F6ca8a2e3103e41d4a67177ce7e3020b0%2Fc45020660ef14454b557e66c551debd7?format=webp&width=800" alt="App Store" /> */}
             {/* <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/0f8acb388f22d934afce78e2cf9a29d9131e9895" alt="App Store" /> */}
           </div>
         </div>
       </div>
     </div>

     <div className="testimonials">
       <div className="Rtext">
         <h1>Satisfied Users Are <br />
         Our Best Ads.</h1>
         <div className="custom-swiper-buttons">
           <button className="swiper-button-prev-custom" aria-label="Previous testimonials">
             <i className="fas fa-chevron-left"></i>
           </button>
           <button className="swiper-button-next-custom" aria-label="Next testimonials">
             <i className="fas fa-chevron-right"></i>
           </button>
         </div>
       </div>
       <div className="slider">
         <Swiper
           ref={swiperRef}
           spaceBetween={50}
           slidesPerView={3}
           slidesPerGroup={1}
           loop={false}
           allowSlideNext={true}
           allowSlidePrev={true}
           onSlideChange={() => console.log('slide change')}
           onSwiper={(swiper) => console.log(swiper)}
           modules={[Navigation]}
           navigation={false}
           breakpoints={{
             320: { slidesPerView: 1, slidesPerGroup: 1 },
             768: { slidesPerView: 2, slidesPerGroup: 1 },
             1024: { slidesPerView: 3, slidesPerGroup: 1 }
           }}
         >
           {homeTestimonial && homeTestimonial.length > 0 ? (
             homeTestimonial.map((testimonial, index) => (
               <SwiperSlide className="testimonials-content" key={index}>
                 <div className="testimonials-box">
                   <div className="comment">
                     <div className="quote">
                       <img src={quote} alt="" />
                     </div>
                     <p>"{testimonial.testimonial}"</p>
                   </div>
                   <div className="Rdivider"></div>
                   <div className="info">
                     <img src={testimonial.image || profile} alt="profile"/>
                     <div className="Rright">
                       <div className="text-box">
                         <h3 className="user-name">{testimonial.name}</h3>
                       </div>
                       <div className="rating">
                         <i className="fa fa-star"></i>
                         <i className="fa fa-star"></i>
                         <i className="fa fa-star"></i>
                         <i className="fa fa-star"></i>
                         <i className="fa fa-star"></i>
                       </div>
                     </div>
                   </div>
                 </div>
               </SwiperSlide>
             ))
           ) : (
             <>
             </>
           )}
         </Swiper>
       </div>
     </div>

     <div className="qna">
       <div className="Qemail">
         <h1>Got A Question <br />For EcBarko?</h1>
         <p>If there are questions you want to ask, <br />
         we will answer all your questions.</p>

         <div className="Qemail-container">
           <form className="QemailForm" onSubmit={handleSubmit}>
             <input
               type="email"
               placeholder="Enter Your Email"
               className="emailInput"
               value={email}
               onChange={handleEmailChange}
               required
               aria-label="Email address"
               disabled={isSubmitting}
             />
             <button 
               type="submit" 
               className="submitButton"
               disabled={isSubmitting}
             >
               {isSubmitting ? 'Sending...' : 'Submit'}
             </button>
           </form>
         </div>
       </div>

       <div className="Qfaqs">
           <p>Maybe your question has already been <br />answered. Check this out:</p>
           <div className="Qdivider"></div>
           
           {homeFAQs && homeFAQs.length > 0 ? (
             homeFAQs.map((faq, index) => (
               <React.Fragment key={index}>
                 <div className={`Q${index + 1}`}>
                   <button onClick={() => handlePopup(faq.question, faq.answer)}>
                     <span>{faq.question}</span>
                   </button>
                 </div>
                 <div className="Qdivider"></div>
               </React.Fragment>
             ))
           ) : (
             <>
             </>
           )}
         </div>
         
         {popup.visible && (
           <div className="lp-popup-overlay" onClick={closePopup}>
             <div className="lp-popup-box" onClick={(e) => e.stopPropagation()}>
               <h2>{popup.question}</h2>
               <p>{popup.answer}</p>
               <button onClick={closePopup} className="popup-close">Close</button>
             </div>
           </div>
         )}
       </div>

       <Footer/>

   </div>
 );
}

export default LandingPage;