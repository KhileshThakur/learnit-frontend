import React, { useState } from 'react';
import './NewPost.css';

const NewPost = ({ onAddThread, onAddReply }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim() !== '') {
      if (onAddThread) onAddThread(inputText);
      if (onAddReply) onAddReply(inputText);
      setInputText('');
    }
  };

  return (
    <div className="new-post">
      <input
        type="text"
        value={inputText}
        placeholder="Type your question or reply here..."
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
};

export default NewPost;