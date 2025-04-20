// Thread.js
import React from 'react';
import './Thread.css';

const Thread = ({ thread, onClick }) => {
  return (
    <div className="thread-item" onClick={onClick}>
      <p>{thread.question}</p>
    </div>
  );
};

export default Thread;