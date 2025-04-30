import React from 'react';
import './VideoContainer.css';

const VideoContainer = ({ children, name, role, isSelf = false, isMuted = false }) => {
  return (
    <div className={`video-container ${isSelf ? 'self-video' : ''}`}>
      {children}
      <div className="video-info">
        <div className="video-name">
          {name}
          {role && <span className="video-role">{role}</span>}
          {isSelf && <span className="self-indicator">(You)</span>}
        </div>
        {isMuted && (
          <div className="muted-indicator">
            <i className="fas fa-microphone-slash"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoContainer; 