import React from 'react';
import './Thread.css';

const Thread = ({ thread, onClick, isSelected }) => {
  return (
    <div
      className={`thread-item ${isSelected ? 'selected-thread' : ''}`}
      onClick={onClick}
    >
      {/* Show Author Name Above Question */}
      {thread.authorId && thread.authorId.name && (
        <h4 className="thread-author">{thread.authorId.name} ({thread.authorType})</h4>
      )}
      <p className="thread-question">{thread.question}</p>
    </div>
  );
};

export default Thread;
