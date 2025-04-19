import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './CreateCourse.css';

const CreateCourse = ({ onCourseCreated }) => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    expertise: '',
    price: 0
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create and set thumbnail preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('expertise', formData.expertise);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('instructorId', id);
      
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      const response = await fetch(`${backendurl}/courses`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        duration: '',
        expertise: '',
        price: 0
      });
      setThumbnail(null);
      setThumbnailPreview(null);
      
      // Call the callback to refresh the courses list
      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <h2>Create New Course</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Course created successfully!</div>}
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label>Course Title</label>
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
          <label>Duration (e.g., 8 weeks)</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Expertise Level</label>
          <select
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            required
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
          {thumbnailPreview && (
            <div className="thumbnail-preview">
              <img src={thumbnailPreview} alt="Thumbnail preview" />
            </div>
          )}
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse; 