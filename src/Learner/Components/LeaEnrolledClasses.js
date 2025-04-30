import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LeaEnrolledClasses.css';

const LeaEnrolledClasses = ({ courseId }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendurl}/classes/courses/${courseId}/classes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchClasses();
    }
  }, [courseId, backendurl, token]);

  const handleJoinClass = async (classId) => {
    try {
      // First check if the class can be joined
      const checkResponse = await fetch(`${backendurl}/classes/classes/${classId}/can-join`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const checkData = await checkResponse.json();

      if (!checkData.canJoin) {
        toast.info(checkData.message || 'Class is not available for joining yet');
        return;
      }

      // If class can be joined, redirect to classroom
      toast.success('✅ You have joined the class!');
      navigate(`/classroom/${classId}`);
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) return <div className="loading">Loading classes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="enrolled-classes-container">
      <h3>Course Classes</h3>
      
      {classes.length === 0 ? (
        <div className="no-classes">
          <p>No classes have been scheduled for this course yet.</p>
        </div>
      ) : (
        <div className="classes-list">
          {classes.map((classItem) => (
            <div key={classItem._id} className="class-card">
              <div className="class-header">
                <h4>{classItem.title}</h4>
                {classItem.isLive && (
                  <span className="live-badge">LIVE</span>
                )}
              </div>
              
              <div className="class-details">
                <div className="class-schedule">
                  <div className="schedule-item">
                    <strong>Date:</strong> {formatDate(classItem.date)}
                  </div>
                  <div className="schedule-item">
                    <strong>Time:</strong> {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                  </div>
                </div>
                
                {classItem.description && (
                  <p className="class-description">{classItem.description}</p>
                )}
                
                <div className="class-actions">
                  {classItem.isLive ? (
                    <button
                      className="join-class-btn"
                      onClick={() => handleJoinClass(classItem._id)}
                    >
                      Join Live Class
                    </button>
                  ) : (
                    <div className="class-status">
                      <span className="status-badge not-started">
                        Not Started
                      </span>
                      <p className="status-message">
                        Class will start on {formatDate(classItem.date)} at {formatTime(classItem.startTime)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaEnrolledClasses;