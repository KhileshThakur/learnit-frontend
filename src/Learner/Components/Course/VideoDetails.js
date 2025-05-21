import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const VideoDetails = ({ video, course, learnerId, onBack, onCourseBack }) => {
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  const handleUnenroll = async () => {
    try {
      setUnenrollLoading(true);
      await axios.post('http://localhost:5000/api/course/unenroll', {
        learnerId,
        courseId: course._id,
      });
      toast.success('Unenrolled successfully!');
      onCourseBack(); // Go back to enrolled courses list after unenroll
    } catch {
      toast.error('Failed to unenroll');
    } finally {
      setUnenrollLoading(false);
    }
  };

  return (
    <div className="video-detail">
      <button onClick={onBack} className="back-btn">← Back to Course Details</button>
      <h2>{video.title}</h2>
      {/* Example embed or video URL display */}
      {video.videoUrl ? (
        <video controls width="600" src={video.videoUrl} />
      ) : (
        <p>No video URL available.</p>
      )}

      <button
        onClick={handleUnenroll}
        disabled={unenrollLoading}
        className="unenroll-btn"
        style={{ marginTop: '20px' }}
      >
        {unenrollLoading ? 'Unenrolling...' : 'Unenroll from Course'}
      </button>

      <ToastContainer />
    </div>
  );
};

export default VideoDetails;
