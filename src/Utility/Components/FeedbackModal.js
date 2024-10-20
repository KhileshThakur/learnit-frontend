import React, { useState } from 'react';
import './FeedBackModal.css'

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && authorName) {
      onSubmit({ message, authorName });
      setMessage('');
      setAuthorName(''); 
      onClose(); 
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="authorName">Author Name:</label>
              <input
                type="text"
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="modal-buttons">
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default FeedbackModal;
