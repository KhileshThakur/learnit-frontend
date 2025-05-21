import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseDetails from '../Components/Course/CourseDetail';

const LeaEnrolledCourses = ({ learnerId }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/course/enrolled/${learnerId}`);
        setEnrolledCourses(res.data);
      } catch (err) {
        setError('Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) {
      fetchEnrolledCourses();
    }
  }, [learnerId]);

  if (loading) return <p>Loading enrolled courses...</p>;
  if (error) return <p>{error}</p>;

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        learnerId={learnerId}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="enrolled-courses">
      <h2>Enrolled Courses</h2>
      <p>Welcome, Learner {learnerId}!</p>
      {enrolledCourses.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <div className="courses-grid">
          {enrolledCourses.map(course => (
            <div
              key={course._id}
              className="course-card"
              onClick={() => setSelectedCourse(course)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{course.title}</h3>
              <p>{course.description || 'No description available.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaEnrolledCourses;
