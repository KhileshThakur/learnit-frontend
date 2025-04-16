// SmallLoading.js
import React from 'react';
import './SmallLoading.css';

const SmallLoading = () => {
  return (
    <div className="small-loading">
      <span className="dot" style={{ animationDelay: '0s' }}>.</span>
      <span className="dot" style={{ animationDelay: '0.2s' }}>.</span>
      <span className="dot" style={{ animationDelay: '0.4s' }}>.</span>
      <span className="dot" style={{ animationDelay: '0.6s' }}>.</span>
      <span className="dot" style={{ animationDelay: '0.8s' }}>.</span>
    </div>
  );
};

export default SmallLoading;
