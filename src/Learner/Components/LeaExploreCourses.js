import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './LeaExploreCourses.css';

const LeaExploreCourses = () => {
  const backendurl = process.env.REACT_APP_BACKEND || 'http://localhost:5000';
  const { id: learnerId } = useParams();
  const [courses, setCourses] = useState([]);
  const [courseThumbnails, setCourseThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    expertise: 'all',
    priceRange: 'all'
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch all available courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendurl}/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
      
      // After fetching courses, fetch thumbnails for each course
      const thumbnails = {};
      await Promise.all(
        data.courses.map(async (course) => {
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
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch already enrolled courses for the learner
  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch(`${backendurl}/enrollments/learner/${learnerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }
      
      const data = await response.json();
      setEnrolledCourses(data.enrollments?.map(enrollment => enrollment.courseId) || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
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

  const handleEnrollClick = (course) => {
    setEnrollingCourse(course);
    setEnrollmentSuccess(null);
    setEnrollmentError(null);
  };

  const handleCancelEnroll = () => {
    setEnrollingCourse(null);
    setEnrollmentSuccess(null);
    setEnrollmentError(null);
  };

  const handleConfirmEnroll = async () => {
    setEnrollmentLoading(true);
    setEnrollmentError(null);

    try {
      const response = await fetch(`${backendurl}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnerId,
          courseId: enrollingCourse._id,
          enrollmentDate: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll in the course');
      }

      setEnrollmentSuccess(`Successfully enrolled in ${enrollingCourse.title}`);
      
      // Update enrolled courses list
      setEnrolledCourses(prev => [...prev, enrollingCourse._id]);
      
      // Reset enrollment dialog after a short delay
      setTimeout(() => {
        setEnrollingCourse(null);
        setEnrollmentSuccess(null);
      }, 2000);
    } catch (error) {
      setEnrollmentError(error.message);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter(course => {
    // Search term filter
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Expertise level filter
    const matchesExpertise = 
      filters.expertise === 'all' || 
      course.expertise.toLowerCase() === filters.expertise.toLowerCase();
    
    // Price range filter
    let matchesPrice = true;
    if (filters.priceRange === 'free') {
      matchesPrice = course.price === 0;
    } else if (filters.priceRange === 'paid') {
      matchesPrice = course.price > 0;
    } else if (filters.priceRange === 'under50') {
      matchesPrice = course.price > 0 && course.price < 50;
    } else if (filters.priceRange === '50to100') {
      matchesPrice = course.price >= 50 && course.price <= 100;
    } else if (filters.priceRange === 'over100') {
      matchesPrice = course.price > 100;
    }
    
    return matchesSearch && matchesExpertise && matchesPrice;
  });

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  return (
    <div className="lea-explore-courses">
      <h2>Explore Courses</h2>
      
      <div className="explore-courses-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="expertise">Expertise Level:</label>
            <select 
              id="expertise" 
              name="expertise" 
              value={filters.expertise}
              onChange={handleFilterChange}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="priceRange">Price Range:</label>
            <select 
              id="priceRange" 
              name="priceRange" 
              value={filters.priceRange}
              onChange={handleFilterChange}
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="under50">Under $50</option>
              <option value="50to100">$50 - $100</option>
              <option value="over100">Over $100</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading courses...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="no-courses-message">
          No courses match your search criteria. Try adjusting your filters.
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div className="course-card" key={course._id}>
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
                  <span className="course-price">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>
                <div className="course-actions">
                  {isEnrolled(course._id) ? (
                    <button className="already-enrolled-btn" disabled>Already Enrolled</button>
                  ) : (
                    <button 
                      className="enroll-btn"
                      onClick={() => handleEnrollClick(course)}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {enrollingCourse && (
        <div className="enrollment-modal">
          <div className="enrollment-dialog">
            <h3>Enroll in {enrollingCourse.title}</h3>
            <p>Are you sure you want to enroll in this course?</p>
            
            {enrollingCourse.price > 0 && (
              <div className="price-info">
                <p>Course Price: ${enrollingCourse.price}</p>
                <p className="small">Note: This is a demo, no actual payment will be processed.</p>
              </div>
            )}
            
            {enrollmentSuccess && (
              <div className="success-message">{enrollmentSuccess}</div>
            )}
            
            {enrollmentError && (
              <div className="error-message">{enrollmentError}</div>
            )}
            
            <div className="dialog-actions">
              <button 
                className="cancel-btn" 
                onClick={handleCancelEnroll}
                disabled={enrollmentLoading}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirmEnroll}
                disabled={enrollmentLoading || enrollmentSuccess}
              >
                {enrollmentLoading ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaExploreCourses;
