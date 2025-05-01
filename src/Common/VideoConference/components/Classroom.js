import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoConference from './VideoConference';
import './Classroom.css';

const Classroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backendurl = process.env.REACT_APP_BACKEND;
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  // Compute initial states
  const isInstructor = currentUser.role === 'instructor';
  const isStarting = new URLSearchParams(location.search).get('starting') === 'true';
  const initialCanJoin = isInstructor && isStarting;
  
  // States
  const [loading, setLoading] = useState(!initialCanJoin);
  const [error, setError] = useState(null);
  const [canJoin, setCanJoin] = useState(initialCanJoin);
  const [classDetails, setClassDetails] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Debug logs
  console.log('=== CLASSROOM COMPONENT DEBUG ===');
  console.log('Class ID:', classId);
  console.log('User:', currentUser);
  console.log('Is Instructor:', isInstructor);
  console.log('Is Starting:', isStarting);
  console.log('Can Join:', canJoin);
  console.log('==============================');

  useEffect(() => {
    const checkClassStatus = async () => {
      try {
        // Skip check if instructor is starting class
        if (isInstructor && isStarting) {
          return;
        }

        // Get class details
        const classResponse = await fetch(`${backendurl}/classes/classes/${classId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!classResponse.ok) {
          throw new Error('Class not found');
        }

        const classData = await classResponse.json();
        setClassDetails(classData.class);

        // Handle instructor access
        if (isInstructor && classData.class.isLive) {
          setCanJoin(true);
          setLoading(false);
          return;
        }

        // Handle learner access
        if (!isInstructor) {
          const joinResponse = await fetch(`${backendurl}/classes/classes/${classId}/can-join`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!joinResponse.ok) {
            throw new Error('Failed to check class join status');
          }

          const joinData = await joinResponse.json();
          
          if (joinData.canJoin) {
            setCanJoin(true);
          } else {
            setTimeRemaining(joinData.message);
            // Check again after a minute
            const timer = setTimeout(checkClassStatus, 60000);
            return () => clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkClassStatus();
  }, [classId, backendurl, isInstructor, isStarting, token]);

  // Loading state
  if (loading && !isStarting) {
    return (
      <div className="classroom-loading">
        <div className="loading-spinner"></div>
        <p>Loading classroom...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="classroom-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Instructor starting class
  if (isInstructor && isStarting) {
    return (
      <div className="classroom-container">
        <div className="classroom-header">
          <h2>{classDetails?.title || 'Live Class'}</h2>
          <div className="instructor-controls">
            <span className="live-indicator">LIVE</span>
          </div>
        </div>
        <VideoConference />
      </div>
    );
  }

  // Waiting state
  if (!canJoin) {
    return (
      <div className="classroom-waiting">
        <h2>Class Not Available Yet</h2>
        <p>{timeRemaining}</p>
        {isInstructor ? (
          <div>
            <p>This class has not been started yet.</p>
            <p>Please go back to your dashboard and click the "Start Class" button to begin.</p>
          </div>
        ) : (
          <p>Please wait for the instructor to start the class.</p>
        )}
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Main classroom view
  return (
    <div className="classroom-container">
      <div className="classroom-header">
        <h2>{classDetails?.title || 'Live Class'}</h2>
        {isInstructor && (
          <div className="instructor-controls">
            <span className="live-indicator">LIVE</span>
          </div>
        )}
      </div>
      <VideoConference />
    </div>
  );
};

export default Classroom; 