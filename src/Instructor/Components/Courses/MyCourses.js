import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyCourses.css';
import CourseDetails from './CourseDetails';

const MyCourses = ({ instructorId }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/course/instructor/${instructorId}`);
      setCourses(res.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p className="loader"></p>;

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        setCourse={setSelectedCourse}   // ✅ ADD THIS LINE
        onBack={() => setSelectedCourse(null)}
        refreshCourses={fetchCourses}
        instructorId={instructorId}
      />

    );
  }

  return (
    <div className="mycourses-container">
      <h2>My Courses</h2>
      <div className="course-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card" onClick={() => setSelectedCourse(course)}>
            <img src={course.thumbnail || 'https://via.placeholder.com/300x180'} alt="thumbnail" />
            <div className="course-overlay">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
