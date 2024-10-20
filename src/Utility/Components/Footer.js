import React from 'react';
import './Footer.css';
import { AiFillMail } from 'react-icons/ai'; // Import Gmail icon
import { FaShareSquare } from 'react-icons/fa'; // Import Share icon

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-left">
        &copy; 2024
      </div>
      <div className="footer-right">
        <a href="mailto:someone@example.com" className="footer-icon" aria-label="Email">
          <AiFillMail size={24} />
        </a>
        <a href="https://www.sharelink.com" className="footer-icon" aria-label="Share">
          <FaShareSquare size={24} />
        </a>
      </div>
    </div>
  );
};

export default Footer;
