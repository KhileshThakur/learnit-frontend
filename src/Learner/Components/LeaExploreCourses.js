import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LeaExploreCourses.css';

const LeaExploreCourses = ({ learnerId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const params = useParams();
  // Use provided learnerId or get from URL params
  const learnerIdToUse = learnerId || params.id;
  const backendUrl = process.env.REACT_APP_BACKEND;
  
  // Default course image
  const defaultCourseImage = 'https://via.placeholder.com/300x180?text=Course+Image';

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/courses`);
        setCourses(response.data.courses);
        
        // Check enrollment status for each course
        const enrollmentChecks = {};
        for (const course of response.data.courses) {
          const statusResponse = await axios.get(
            `${backendUrl}/courses/check-enrollment/${learnerIdToUse}/${course._id}`
          );
          enrollmentChecks[course._id] = statusResponse.data.isEnrolled;
        }
        setEnrollmentStatus(enrollmentChecks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    if (learnerIdToUse) {
      fetchCourses();
    }
  }, [backendUrl, learnerIdToUse]);

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      const response = await axios.post(`${backendUrl}/courses/enroll`, {
        learnerId: learnerIdToUse,
        courseId
      });

      if (response.status === 201) {
        // Update enrollment status for this course
        setEnrollmentStatus(prev => ({
          ...prev,
          [courseId]: true
        }));
        toast.success('✅ Enrolled successfully!');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      if (error.response && error.response.status === 400) {
        toast.info('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll. Please try again later.');
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <h1>Explore Courses</h1>
      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div className="course-card" key={course._id}>
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
                {enrollmentStatus[course._id] ? (
                  <div className="enrollment-actions">
                    <div className="enrolled-status">
                      <span className="already-enrolled-text">Already Enrolled</span>
                    </div>
                    <button className="view-course-btn">
                      View Course
                    </button>
                  </div>
                ) : (
                  <button 
                    className="enroll-btn" 
                    onClick={() => handleEnroll(course._id)}
                  >
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <p>No courses available at the moment. Check back later!</p>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default LeaExploreCourses;
