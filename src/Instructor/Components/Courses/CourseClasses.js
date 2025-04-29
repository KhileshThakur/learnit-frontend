import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateClass from '../Classes/CreateClass';
import EditClass from '../Classes/EditClass';
import './CourseClasses.css';

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString) => {
  // Convert "HH:MM" format to display time with AM/PM
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const CourseClasses = ({ courseId, courseName }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);
  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendurl}/classes/courses/${courseId}/classes`, {
        headers: {
          'Content-Type': 'application/json',
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

  useEffect(() => {
    fetchClasses();
  }, [courseId, backendurl, token]);

  const handleDeleteClick = (classItem) => {
    setDeletingClass(classItem);
  };

  const handleCancelDelete = () => {
    setDeletingClass(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${backendurl}/classes/classes/${deletingClass._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ instructorId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }

      setDeletingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      setError(error.message);
    }
  };

  const handleEditClick = (classItem) => {
    setEditingClass(classItem);
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
  };

  const startClass = async (classItem) => {
    try {
      console.log('Starting class with ID:', classItem._id);
      console.log('Backend URL:', backendurl);
      console.log('API endpoint:', `${backendurl}/classes/classes/${classItem._id}/start`);
      
      const response = await fetch(`${backendurl}/classes/classes/${classItem._id}/start`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Start class failed with status:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          throw new Error(errorData.message || 'Failed to start class');
        } catch (jsonError) {
          throw new Error('Failed to start class - server error');
        }
      }

      const data = await response.json();
      console.log('Start class response:', data);
      
      // Navigate to the classroom page with a starting flag to indicate it was just started
      navigate(`/classroom/${classItem._id}?starting=true`);
    } catch (error) {
      console.error('Error starting class:', error);
      setError(error.message);
    }
  };

  const renderDeleteConfirmation = () => {
    if (!deletingClass) return null;

    return (
      <div className="delete-confirmation">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete the class "{deletingClass.title}"?</p>
        <p>This action cannot be undone.</p>
        
        <div className="confirmation-buttons">
          <button className="cancel-btn" onClick={handleCancelDelete}>Cancel</button>
          <button className="delete-btn" onClick={handleConfirmDelete}>Delete</button>
        </div>
      </div>
    );
  };

  if (isCreating) {
    return (
      <CreateClass 
        courseId={courseId} 
        onClassCreated={() => {
          setIsCreating(false);
          fetchClasses();
        }} 
        onCancel={() => setIsCreating(false)} 
      />
    );
  }

  if (editingClass) {
    return (
      <EditClass 
        classData={editingClass}
        onClassUpdated={() => {
          setEditingClass(null);
          fetchClasses();
        }}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (loading) return <div className="loading">Loading classes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="course-classes-container">
      <div className="classes-header">
        <h2>Classes for {courseName}</h2>
        <button className="add-class-btn" onClick={() => setIsCreating(true)}>
          Add New Class
        </button>
      </div>

      {deletingClass && renderDeleteConfirmation()}

      {classes.length === 0 ? (
        <div className="no-classes">
          <p>No classes have been created for this course yet.</p>
          <p>Click "Add New Class" to schedule your first class.</p>
        </div>
      ) : (
        <div className="classes-list">
          {classes.map((classItem) => (
            <div key={classItem._id} className="class-card">
              <div className="class-header">
                <h3>{classItem.title}</h3>
                <div className="class-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEditClick(classItem)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteClick(classItem)}
                  >
                    Delete
                  </button>
                  <button 
                    className="start-class-btn" 
                    onClick={() => startClass(classItem)}
                  >
                    Start Class
                  </button>
                </div>
              </div>
              
              <div className="class-details">
                <p className="class-date">
                  <strong>Date:</strong> {formatDate(classItem.date)}
                </p>
                <p className="class-time">
                  <strong>Time:</strong> {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                </p>
                {classItem.meetingLink && (
                  <p className="class-meeting">
                    <strong>Meeting:</strong> 
                    <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </p>
                )}
                <div className="class-description">
                  <strong>Description:</strong>
                  <p>{classItem.description}</p>
                </div>
                {classItem.streamInfo && (
                  <div className="class-stream-info">
                    <strong>Stream Info:</strong>
                    <p>{classItem.streamInfo}</p>
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

export default CourseClasses; 