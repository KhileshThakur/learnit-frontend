import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LeaEnrolledClasses.css';

const LeaEnrolledClasses = ({ courseId }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinStatus, setJoinStatus] = useState({});

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendurl}/api/classes/courses/${courseId}/classes`);
        
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
  }, [courseId, backendurl]);

  // Check if learner can join each live class
  useEffect(() => {
    const checkJoinStatus = async () => {
      const liveClasses = classes.filter(c => c.isLive);
      
      for (const classItem of liveClasses) {
        try {
          const response = await fetch(`${backendurl}/api/classes/${classItem._id}/can-join`);
          if (response.ok) {
            const data = await response.json();
            setJoinStatus(prev => ({
              ...prev,
              [classItem._id]: data
            }));
          }
        } catch (error) {
          console.error(`Error checking join status for class ${classItem._id}:`, error);
        }
      }
    };
    
    if (classes.length > 0) {
      checkJoinStatus();
      
      // Set up a timer to refresh join status every minute
      const intervalId = setInterval(checkJoinStatus, 60000);
      return () => clearInterval(intervalId);
    }
  }, [classes, backendurl]);

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
          {classes.map((classItem) => {
            const canJoin = classItem.isLive && joinStatus[classItem._id]?.canJoin;
            const joinMessage = joinStatus[classItem._id]?.message;
            
            return (
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
                      <strong>Date:</strong> {new Date(classItem.date).toLocaleDateString()}
                    </div>
                    <div className="schedule-item">
                      <strong>Time:</strong> {classItem.startTime} - {classItem.endTime}
                    </div>
                  </div>
                  
                  <p className="class-description">{classItem.description}</p>
                  
                  {classItem.isLive ? (
                    <div className="class-actions">
                      {canJoin ? (
                        <Link to={`/classroom/${classItem._id}`} className="join-class-btn">
                          Join Live Class
                        </Link>
                      ) : (
                        <div className="class-waiting">
                          <span className="waiting-badge">Waiting</span>
                          <p className="waiting-message">{joinMessage || "Class will be available soon."}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="class-status">
                      <span className="scheduled-badge">
                        Scheduled
                      </span>
                      <span className="schedule-time">
                        {new Date(classItem.date).toLocaleDateString()} at {classItem.startTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaEnrolledClasses;