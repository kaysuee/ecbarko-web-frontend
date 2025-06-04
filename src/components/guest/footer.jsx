import React from 'react';
import '../../styles/Footer.css'
import flogo from '../../assets/imgs/logo-white.png'
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
 
function Footer() {
return (
   <footer className="footer">
     <div className="flogo">
       <img src={flogo} alt="logo" />
     </div>
     <p>&copy; {new Date().getFullYear()} EcBarko. All rights reserved.</p>
       <div className="Fsns">
           <a
             href="https://www.facebook.com/profile.php?id=61576835769493"
             aria-label="Facebook"
             target="_blank"
             rel="noopener noreferrer"
           >
             <FaFacebookF className="ffb" />
           </a>
           <a
             href="https://x.com/ph_ports"
             aria-label="X (formerly Twitter)"
             target="_blank"
             rel="noopener noreferrer"
           >
             <FaXTwitter className="ftwt" />
           </a>
           <a
             href="https://www.instagram.com/ph_ports/"
             aria-label="Instagram"
             target="_blank"
             rel="noopener noreferrer"
           >
             <FaInstagram className="fig" />
           </a>
     </div>
   </footer>
);
}
 
export default Footer;