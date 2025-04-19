import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoConference from './VideoConference';
import './Classroom.css';

const Classroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canJoin, setCanJoin] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  const backendurl = process.env.REACT_APP_BACKEND;
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isInstructor = currentUser.role === 'instructor';
  const token = localStorage.getItem('token');
  
  // Check URL for starting=true parameter
  const isStarting = new URLSearchParams(location.search).get('starting') === 'true';
  
  // Debug logs
  console.log('Current user role:', isInstructor ? 'Instructor' : 'Learner');
  console.log('Starting parameter present:', isStarting);
  
  // Immediately set canJoin to true if instructor is starting class
  useEffect(() => {
    if (isInstructor && isStarting) {
      console.log('Instructor is starting class, enabling immediate join');
      setCanJoin(true);
      setLoading(false);
    }
  }, [isInstructor, isStarting]);
  
  useEffect(() => {
    const checkClassStatus = async () => {
      try {
        console.log('Class ID:', classId);
        console.log('Backend URL:', backendurl);
        
        // If instructor is starting class, skip the class check
        if (isInstructor && isStarting) {
          console.log('Skipping class status check for starting instructor');
          return;
        }
        
        // First get class details with authorization
        const classResponse = await fetch(`${backendurl}/classes/classes/${classId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!classResponse.ok) {
          console.error('Class fetch failed with status:', classResponse.status);
          throw new Error('Class not found');
        }
        
        const classData = await classResponse.json();
        console.log('Class data:', classData);
        setClassDetails(classData.class);
        
        // Check if the class is live (already started)
        const isClassLive = classData.class && classData.class.isLive;
        console.log('Is class live:', isClassLive);
        
        // If user is instructor, they can always join if the class is live or they're starting it
        if (isInstructor && (isClassLive || isStarting)) {
          console.log('Instructor can join: class is live or being started');
          setCanJoin(true);
          setLoading(false);
          return;
        }
        
        // For learners, check if they can join with authorization
        const joinResponse = await fetch(`${backendurl}/classes/classes/${classId}/can-join`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!joinResponse.ok) {
          console.error('Join check failed with status:', joinResponse.status);
          throw new Error('Failed to check class join status');
        }
        
        const joinData = await joinResponse.json();
        
        if (joinData.canJoin) {
          setCanJoin(true);
        } else {
          // Show waiting message with countdown
          setTimeRemaining(joinData.message);
          
          // Set up timer to check again
          const timer = setTimeout(() => {
            checkClassStatus();
          }, 60000); // Check every minute
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking class status:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkClassStatus();
  }, [classId, backendurl, isInstructor, isStarting, token]);
  
  // Make sure instructor can join if class is live
  useEffect(() => {
    if ((classDetails && classDetails.isLive && isInstructor) || (isInstructor && isStarting)) {
      console.log('Setting canJoin=true for instructor with live class or starting param');
      setCanJoin(true);
    }
  }, [classDetails, isInstructor, isStarting]);
  
  // Debug-only: force show video conference for instructors
  useEffect(() => {
    if (isInstructor && !canJoin) {
      console.log('DEBUG: Forcing canJoin=true for instructor due to lingering issue');
      setTimeout(() => setCanJoin(true), 500);
    }
  }, [isInstructor, canJoin]);
  
  if (loading && !isStarting) {
    return (
      <div className="classroom-loading">
        <div className="loading-spinner"></div>
        <p>Loading classroom...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="classroom-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  
  // Force instructors to see video conference when starting=true is in URL
  if (isInstructor && isStarting) {
    console.log('Rendering video conference due to instructor starting class');
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