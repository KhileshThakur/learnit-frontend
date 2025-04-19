import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateClass.css'; // We can reuse the styles from CreateClass

const EditClass = ({ classData, onClassUpdated, onCancel }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    title: classData.title || '',
    description: classData.description || '',
    date: classData.date ? new Date(classData.date).toISOString().split('T')[0] : '',
    startTime: classData.startTime || '',
    endTime: classData.endTime || '',
    meetingLink: classData.meetingLink || '',
    streamInfo: classData.streamInfo || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  // Initialize form data from classData prop
  useEffect(() => {
    if (classData) {
      // Format date to YYYY-MM-DD for input
      const formattedDate = new Date(classData.date).toISOString().split('T')[0];
      
      setFormData({
        title: classData.title || '',
        description: classData.description || '',
        date: formattedDate || '',
        startTime: classData.startTime || '',
        endTime: classData.endTime || '',
        meetingLink: classData.meetingLink || '',
        streamInfo: classData.streamInfo || ''
      });
    }
  }, [classData]);

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
      const classDataToUpdate = {
        ...formData,
        instructorId: id
      };

      const response = await fetch(`${backendurl}/classes/classes/${classData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classDataToUpdate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update class');
      }

      setSuccess(true);
      
      // Notify parent component that class was updated
      setTimeout(() => {
        if (onClassUpdated) {
          onClassUpdated();
        }
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-class-container">
      <h2>Edit Class</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Class updated successfully!</div>}
      
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
            {loading ? 'Updating...' : 'Update Class'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClass; 