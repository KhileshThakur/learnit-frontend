import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LeaExploreCourses.css';

const LeaExploreCourses = ({ learnerId }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesRes = await axios.get('http://localhost:5000/api/course/all');
        const enrolledRes = await axios.get(`http://localhost:5000/api/course/enrolled/${learnerId}`);

        const allCourses = coursesRes.data.courses || coursesRes.data;
        setCourses(allCourses);

        const enrolledIds = new Set(enrolledRes.data.map(course => course._id));
        setEnrolledCourseIds(enrolledIds);
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [learnerId]);

  const handleEnroll = async (courseId) => {
    try {
      await axios.post('http://localhost:5000/api/course/enroll/', { learnerId, courseId });
      toast.success('Enrolled successfully!');
      setEnrolledCourseIds(new Set(enrolledCourseIds).add(courseId));
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to enroll');
      }
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div className="explore-courses">
      <ToastContainer />
      <h2 className="page-title">Explore Courses</h2>
      <p className="welcome-text">Welcome to the course exploration page, Learner {learnerId}!</p>

      {courses.length === 0 ? (
        <p>No courses available right now.</p>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div
              key={course._id}
              className="course-card"
              onMouseEnter={() => setHoveredCourseId(course._id)}
              onMouseLeave={() => setHoveredCourseId(null)}
              style={{
                backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                position: 'relative',
              }}
            >
              <div className="course-card-overlay">
                {console.log(course)}
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description || 'No description available.'}</p>
              </div>

              {hoveredCourseId === course._id && course.videos && course.videos.length > 0 && (
                <div className="video-popup">
                  <h4>Videos</h4>
                  <ul>
                    {course.videos.map(video => (
                      <li key={video._id}>{video.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="course-card-footer">
                {enrolledCourseIds.has(course._id) ? (
                  <button className="enroll-btn enrolled" disabled>Enrolled</button>
                ) : (
                  <button className="enroll-btn" onClick={() => handleEnroll(course._id)}>Enroll</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaExploreCourses;
