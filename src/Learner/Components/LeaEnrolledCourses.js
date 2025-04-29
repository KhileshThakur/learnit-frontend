import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './LeaEnrolledCourses.css';
import LeaCourseClasses from './LeaCourseClasses';

const LeaEnrolledCourses = () => {
  const backendurl = process.env.REACT_APP_BACKEND || 'http://localhost:5000';
  const { id: learnerId } = useParams();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseThumbnails, setCourseThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch enrolled courses for the learner
  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendurl}/enrollments/learner/${learnerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }
      
      const data = await response.json();
      
      // If we have enrollments, fetch course details for each enrollment
      if (data.enrollments && data.enrollments.length > 0) {
        const courseDetails = await Promise.all(
          data.enrollments.map(async (enrollment) => {
            try {
              const courseResponse = await fetch(`${backendurl}/courses/${enrollment.courseId}`);
              if (!courseResponse.ok) {
                throw new Error(`Failed to fetch course details for ${enrollment.courseId}`);
              }
              const courseData = await courseResponse.json();
              return {
                ...courseData.course,
                enrollmentDate: enrollment.enrollmentDate,
                enrollmentId: enrollment._id
              };
            } catch (error) {
              console.error(`Error fetching course ${enrollment.courseId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out any null values (failed fetches)
        const validCourses = courseDetails.filter(course => course !== null);
        setEnrolledCourses(validCourses);
        
        // After fetching courses, fetch thumbnails for each course
        const thumbnails = {};
        await Promise.all(
          validCourses.map(async (course) => {
            try {
              const thumbUrl = await fetchCourseThumbnail(course._id);
              if (thumbUrl) {
                thumbnails[course._id] = thumbUrl;
              }
            } catch (error) {
              console.error(`Error fetching thumbnail for course ${course._id}:`, error);
            }
          })
        );
        
        setCourseThumbnails(thumbnails);
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [learnerId, backendurl]);

  const fetchCourseThumbnail = async (courseId) => {
    try {
      const response = await fetch(`${backendurl}/courses/${courseId}/thumbnail`);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      return null;
    }
  };

  const handleViewClasses = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter courses based on search term
  const filteredCourses = enrolledCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (selectedCourse) {
    return (
      <LeaCourseClasses 
        course={selectedCourse} 
        onBack={handleBackToCourses}
        learnerId={learnerId}
      />
    );
  }

  return (
    <div className="lea-enrolled-courses">
      <h2>My Enrolled Courses</h2>
      
      <div className="enrolled-courses-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search my courses..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading your courses...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="no-courses-message">
          <p>You haven't enrolled in any courses yet.</p>
          <button 
            className="explore-courses-btn"
            onClick={() => window.location.hash = "#/explore-courses"}
          >
            Explore Available Courses
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="no-courses-message">
          No courses match your search criteria.
        </div>
      ) : (
        <div className="enrolled-courses-grid">
          {filteredCourses.map(course => (
            <div className="enrolled-course-card" key={course._id}>
              <div className="course-thumbnail">
                <img 
                  src={courseThumbnails[course._id] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={course.title} 
                />
              </div>
              <div className="course-details">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="course-duration">{course.duration}</span>
                  <span className="course-expertise">{course.expertise}</span>
                </div>
                <div className="enrollment-info">
                  <span className="enrollment-date">
                    Enrolled on: {formatDate(course.enrollmentDate)}
                  </span>
                </div>
                <div className="course-actions">
                  <button 
                    className="view-classes-btn"
                    onClick={() => handleViewClasses(course)}
                  >
                    View Classes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaEnrolledCourses;
