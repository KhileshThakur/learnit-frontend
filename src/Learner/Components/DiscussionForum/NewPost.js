import React, { useState } from 'react';
import './NewPost.css';

const NewPost = ({ onAddThread, onAddReply }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() === '') return;

    if (onAddThread) {
      onAddThread(content);
    } else if (onAddReply) {
      onAddReply(content);
    }

    setContent(''); // clear input after submit
  };

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <textarea
        className="new-post-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={onAddThread ? 'Ask a question...' : 'Write a reply...'}
      />
      <button className="new-post-button" type="submit">
        {onAddThread ? 'Post Question' : 'Post Reply'}
      </button>
    </form>
  );
};

export default NewPost;
