import React from 'react';
import './VideoContainer.css';

const VideoContainer = ({ children, name, isSelf = false }) => {
  return (
    <div className={`video-container ${isSelf ? 'self-video' : ''}`}>
      {children}
      <div className="name-tag">
        {name}
      </div>
    </div>
  );
};

export default VideoContainer; 