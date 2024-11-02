import React, { useState } from 'react';
import './LeaDiscussionForum.css';

const LeaDiscussionForum = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      question: 'Can you identify and fix the errors in the following C++ code?',
      answer: 'The constructor is incorrectly assigning the parameters to themselves...',
      replies: [],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  
  // State for handling replies and likes
  const [replyContent, setReplyContent] = useState('');
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewQuestion('');
  };

  const postQuestion = () => {
    if (newQuestion.trim() === '') return;

    const newPost = {
      id: Date.now(),
      question: newQuestion,
      answer: '',
      replies: [],
    };

    setPosts([...posts, newPost]);
    closeModal();
  };

  const postReply = (postId) => {
    if (replyContent.trim() === '') return;

    const newReply = {
      id: Date.now(),
      content: replyContent,
      likes: 0,
      replyCount: 0,
      replies: [],
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, replies: [...post.replies, newReply] };
      }
      return post;
    });

    setPosts(updatedPosts);
    setReplyContent('');
  };

  const likeReply = (postId, replyId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedReplies = post.replies.map(reply => {
          if (reply.id === replyId) {
            return { ...reply, likes: reply.likes + 1 };
          }
          return reply;
        });
        return { ...post, replies: updatedReplies };
      }
      return post;
    });

    setPosts(updatedPosts);
  };

  return (
    <div className="discussion-forum">
      <button onClick={openModal} className="post-question-button">Post Question</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Post Your Question</h2>
            <textarea
              placeholder="Write your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="question-input"
            ></textarea>
            <div className="modal-buttons">
              <button onClick={postQuestion} className="post-button">Post</button>
              <button onClick={closeModal} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} className="post-row">
          {/* Question Box */}
          <div className="question-box">
            <h3>Question</h3>
            <p>{post.question}</p>
          </div>

          {/* Answer Box */}
          <div className="answer-box">
            <h3>Answer</h3>
            <p>{post.answer || "No answers yet. Be the first to answer!"}</p>

            {/* Reply Input */}
            <textarea
              placeholder="Write your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="reply-input"
            ></textarea>
            <button onClick={() => postReply(post.id)} className="reply-button">Reply</button>

            {/* Displaying Replies */}
            {post.replies.map(reply => (
              <div key={reply.id} className="reply">
                <p>{reply.content}</p>
                <button onClick={() => likeReply(post.id, reply.id)} className="like-button">
                  👍 {reply.likes} Likes
                </button>
                <span>{reply.replyCount} Replies</span>
                {/* Optionally, add nested replies here */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaDiscussionForum;
