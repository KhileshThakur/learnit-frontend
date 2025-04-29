import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaCourseClasses.css';

const LeaCourseClasses = ({ course, onBack, learnerId }) => {
  const backendurl = process.env.REACT_APP_BACKEND 
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        if (!course || !course._id) {
          throw new Error('Invalid course data');
        }
        
        const url = `${backendurl}/classes/courses/${course._id}/classes`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        const data = await response.json();
        
        // Add additional info to each class
        const classesWithStatus = await Promise.all(
          data.classes.map(async (classItem) => {
            const startTime = new Date(classItem.startTime);
            const endTime = new Date(classItem.endTime);
            const now = new Date();
            
            let status = 'upcoming';
            if (classItem.isLive) {
              status = 'live';
            } else if (now > endTime) {
              status = 'past';
            } else if (now >= startTime && now <= endTime) {
              status = 'live';
            }
            
            return {
              ...classItem,
              status
            };
          })
        );
        
        // Sort classes by status and time
        const sortedClasses = classesWithStatus.sort((a, b) => {
          const statusOrder = { live: 0, upcoming: 1, past: 2 };
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          
          if (statusDiff !== 0) {
            return statusDiff;
          }
          
          return new Date(a.startTime) - new Date(b.startTime);
        });
        
        setClasses(sortedClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
    // Set up polling for live status updates
    const interval = setInterval(fetchClasses, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [course._id, backendurl]);

  const handleJoinClass = async (classItem) => {
    setJoinLoading(true);
    try {
      // Check if the learner can join the class
      const canJoinResponse = await fetch(`${backendurl}/classes/classes/${classItem._id}/can-join`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const canJoinData = await canJoinResponse.json();
      
      if (canJoinResponse.ok && canJoinData.canJoin) {
        // If they can join, navigate to the classroom
        navigate(`/classroom/${classItem._id}`);
      } else {
        setError(canJoinData.message || 'You cannot join this class at the moment');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setError('Failed to join class. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setJoinLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate duration in hours and minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`;
    }
    return `${durationMinutes}m`;
  };

  return (
    <div className="lea-course-classes">
      <div className="classes-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Courses
        </button>
        <h2>{course.title} - Classes</h2>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="course-overview">
        <div className="course-info">
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span className="course-duration">{course.duration}</span>
            <span className="course-expertise">{course.expertise}</span>
            <span className="course-price">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="class-status-counts">
        <div className="status-item">
          <span className="status-label live">Live</span>
          <span className="status-count">
            {classes.filter(c => c.status === 'live').length}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label upcoming">Upcoming</span>
          <span className="status-count">
            {classes.filter(c => c.status === 'upcoming').length}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label past">Past</span>
          <span className="status-count">
            {classes.filter(c => c.status === 'past').length}
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="no-classes-message">
          No classes have been scheduled for this course yet.
        </div>
      ) : (
        <div className="classes-list">
          {classes.map(classItem => (
            <div 
              key={classItem._id} 
              className={`class-card ${classItem.status}`}
            >
              <div className="class-info">
                <h3 className="class-title">{classItem.title}</h3>
                <div className="class-details">
                  <div className="class-time">
                    <div className="detail-label">Schedule:</div>
                    <div className="detail-value">
                      {formatDate(classItem.startTime)}
                    </div>
                  </div>
                  <div className="class-duration">
                    <div className="detail-label">Duration:</div>
                    <div className="detail-value">
                      {calculateDuration(classItem.startTime, classItem.endTime)}
                    </div>
                  </div>
                  <div className="class-instructor">
                    <div className="detail-label">Instructor:</div>
                    <div className="detail-value">
                      {classItem.instructorName || 'Not assigned'}
                    </div>
                  </div>
                </div>
                <div className="class-status">
                  <span className={`status-badge ${classItem.status}`}>
                    {classItem.status === 'live' ? 'LIVE NOW' : 
                     classItem.status === 'upcoming' ? 'UPCOMING' : 'PAST'}
                  </span>
                </div>
              </div>
              <div className="class-actions">
                {classItem.status === 'live' && (
                  <button 
                    className="join-class-btn"
                    onClick={() => handleJoinClass(classItem)}
                    disabled={joinLoading}
                  >
                    {joinLoading ? 'Joining...' : 'Join Class'}
                  </button>
                )}
                {classItem.status === 'upcoming' && (
                  <div className="upcoming-info">
                    Class will be available at the scheduled time
                  </div>
                )}
                {classItem.status === 'past' && (
                  <div className="past-info">
                    This class has ended
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaCourseClasses; 