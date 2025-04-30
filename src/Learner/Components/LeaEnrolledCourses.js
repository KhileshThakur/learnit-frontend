import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LeaEnrolledClasses from './LeaEnrolledClasses';
import 'react-toastify/dist/ReactToastify.css';
import './LeaEnrolledCourses.css';

const LeaEnrolledCourses = ({ learnerId }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const params = useParams();
  const learnerIdToUse = learnerId || params.id;
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
  
  // Default course image
  const defaultCourseImage = 'https://via.placeholder.com/300x180?text=Course+Image';

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/courses/enrollments/${learnerIdToUse}`);
        setEnrolledCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        toast.error('Failed to load your enrolled courses. Please try again later.');
        setLoading(false);
      }
    };

    if (learnerIdToUse) {
      fetchEnrolledCourses();
    }
  }, [backendUrl, learnerIdToUse]);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return <div className="loading-container">Loading your enrolled courses...</div>;
  }

  if (selectedCourse) {
    return (
      <div className="enrolled-course-view">
        <button className="back-button" onClick={handleBackToCourses}>
          ← Back to Courses
        </button>
        <div className="course-header">
          <h2>{selectedCourse.title}</h2>
          {selectedCourse.instructorName && (
            <p className="instructor-name">by {selectedCourse.instructorName}</p>
          )}
        </div>
        <LeaEnrolledClasses courseId={selectedCourse._id} />
      </div>
    );
  }

  return (
    <div className="enrolled-courses-container">
      <h1>My Enrolled Courses</h1>
      
      {enrolledCourses.length > 0 ? (
        <div className="enrolled-courses-grid">
          {enrolledCourses.map((course) => (
            <div className="enrolled-course-card" key={course._id}>
              <div className="course-thumbnail">
                <img 
                  src={`${backendUrl}/courses/${course._id}/thumbnail`} 
                  alt={course.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultCourseImage;
                  }}
                />
              </div>
              <div className="course-details">
                <h2>{course.title}</h2>
                {course.instructorName && <p className="instructor-name">by {course.instructorName}</p>}
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>Duration: {course.duration}</span>
                  <span>Level: {course.expertise}</span>
                </div>
                <button 
                  className="view-course-btn"
                  onClick={() => handleViewCourse(course)}
                >
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-enrolled-courses">
          <p>You haven't enrolled in any courses yet.</p>
          <button 
            className="explore-courses-btn"
            onClick={() => document.querySelector('li:nth-child(4)').click()} // Click on "Explore Courses" in the menu
          >
            Explore Available Courses
          </button>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default LeaEnrolledCourses;
