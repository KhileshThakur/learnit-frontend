import React, { useState } from 'react';
import VideoDetails from './VideoDetails';

const CourseDetails = ({ course, learnerId, onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (selectedVideo) {
    return (
      <VideoDetails
        video={selectedVideo}
        course={course}
        learnerId={learnerId}
        onBack={() => setSelectedVideo(null)}
        onCourseBack={onBack}
      />
    );
  }

  return (
    <div className="course-detail">
      <button onClick={onBack} className="back-btn">← Back to Enrolled Courses</button>
      <h2>{course.title}</h2>
      <p>{course.description || 'No description available.'}</p>
      {course.instructor && (
        <p><strong>Instructor:</strong> {course.instructor.name || 'N/A'}</p>
      )}

      {course.videos && course.videos.length > 0 ? (
        <>
          <strong>Videos:</strong>
          <ul className="video-list">
            {course.videos.map(video => (
              <li
                key={video._id}
                onClick={() => setSelectedVideo(video)}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                {video.title}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No videos available.</p>
      )}
    </div>
  );
};

export default CourseDetails;
