import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateClass.css';

const CreateClass = ({ courseId, onClassCreated, onCancel }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    streamInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const classData = {
        ...formData,
        instructorId: id
      };

      const response = await fetch(`${backendurl}/classes/courses/${courseId}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create class');
      }

      setSuccess(true);
      
      // Store the created class ID for potential immediate start
      const createdClassId = data.class._id;
      
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        streamInfo: ''
      });
      
      // Show start class option
      setShowStartOption(true);
      setCreatedClass(data.class);
      
      // Notify parent component that class was created after a delay unless starting immediately
      setTimeout(() => {
        if (onClassCreated && !startingClass) {
          onClassCreated();
        }
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add state for showing the start option and storing created class
  const [showStartOption, setShowStartOption] = useState(false);
  const [createdClass, setCreatedClass] = useState(null);
  const [startingClass, setStartingClass] = useState(false);

  // Function to start the newly created class
  const startNewClass = async () => {
    if (!createdClass || !createdClass._id) return;
    
    setStartingClass(true);
    
    try {
      // API call to mark class as live
      const response = await fetch(`${backendurl}/classes/classes/${createdClass._id}/start`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ instructorId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start class');
      }

      // Redirect to classroom with starting parameter
      navigate(`/classroom/${createdClass._id}?starting=true`);
    } catch (error) {
      console.error('Error starting class:', error);
      setError(error.message);
      setStartingClass(false);
    }
  };

  return (
    <div className="create-class-container">
      <h2>Create New Class</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Class created successfully!</div>}
      
      {showStartOption && (
        <div className="start-class-option">
          <p>Your class has been created. Would you like to start it now?</p>
          <div className="start-class-buttons">
            <button className="secondary-btn" onClick={onClassCreated}>
              Go Back to Classes
            </button>
            <button 
              className="start-class-btn" 
              onClick={startNewClass}
              disabled={startingClass}
            >
              {startingClass ? 'Starting Class...' : 'Start Class Now'}
            </button>
          </div>
        </div>
      )}
      
      {!showStartOption && (
        <form onSubmit={handleSubmit} className="class-form">
          <div className="form-group">
            <label>Class Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group half">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Meeting Link (optional)</label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://meeting-platform.com/your-meeting-id"
            />
          </div>
          
          <div className="form-group">
            <label>Stream Information (optional)</label>
            <textarea
              name="streamInfo"
              value={formData.streamInfo}
              onChange={handleChange}
              rows="2"
              placeholder="Additional information about the stream"
            />
          </div>
          
          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateClass; 