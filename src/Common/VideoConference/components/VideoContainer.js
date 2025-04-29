import React from 'react';
import './VideoContainer.css';

const VideoContainer = ({ children, name, isSelf = false, micOff, cameraOff }) => {
  return (
    <div className={`video-container ${isSelf ? 'self-video' : ''}`}>
      {children}
      
      {/* Status indicators container */}
      <div className="status-indicator">
        {micOff && <div className="mic-off-indicator"></div>}
        {cameraOff && <div className="camera-off-indicator"></div>}
      </div>
      
      <div className="name-tag">
        {name}
      </div>
    </div>
  );
};

export default VideoContainer; 