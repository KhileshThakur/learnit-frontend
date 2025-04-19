import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseClasses from './CourseClasses';
import './InstructorCourses.css';

// Placeholder image for courses without thumbnails
const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

const InstructorCourses = () => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [courseThumbnails, setCourseThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [viewingClasses, setViewingClasses] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    expertise: '',
    price: 0
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendurl}/courses/instructor/${id}`);
      
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

  useEffect(() => {
    fetchCourses();
  }, [id, backendurl]);

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

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      expertise: course.expertise,
      price: course.price
    });
    setThumbnail(null);
    setThumbnailPreview(null);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleDeleteClick = (course) => {
    setDeletingCourse(course);
  };

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

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      duration: '',
      expertise: '',
      price: 0
    });
    setThumbnail(null);
    setThumbnailPreview(null);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCancelDelete = () => {
    setDeletingCourse(null);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(false);

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

      const response = await fetch(`${backendurl}/courses/${editingCourse._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update course');
      }

      setFormSuccess(true);
      
      // Refresh the courses list
      fetchCourses();
      
      // Reset form after a short delay
      setTimeout(() => {
        setEditingCourse(null);
        setFormData({
          title: '',
          description: '',
          duration: '',
          expertise: '',
          price: 0
        });
        setThumbnail(null);
        setThumbnailPreview(null);
        setFormSuccess(false);
      }, 2000);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setFormLoading(true);
    try {
      const response = await fetch(`${backendurl}/courses/${deletingCourse._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }

      setDeletingCourse(null);
      
      // Refresh the courses list
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleManageClassesClick = (course) => {
    setViewingClasses(course);
  };

  const handleBackToCourses = () => {
    setViewingClasses(null);
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (viewingClasses) {
    return (
      <div className="course-classes-wrapper">
        <button className="back-to-courses-btn" onClick={handleBackToCourses}>
          ← Back to Courses
        </button>
        <CourseClasses courseId={viewingClasses._id} courseName={viewingClasses.title} />
      </div>
    );
  }

  if (editingCourse) {
    return (
      <div className="edit-course-container">
        <h2>Edit Course</h2>
        
        {formError && <div className="error-message">{formError}</div>}
        {formSuccess && <div className="success-message">Course updated successfully!</div>}
        
        <form onSubmit={handleSubmitEdit} className="course-form">
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
            <label>Thumbnail Image (Leave empty to keep current thumbnail)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview ? (
              <div className="thumbnail-preview">
                <img src={thumbnailPreview} alt="Thumbnail preview" />
              </div>
            ) : courseThumbnails[editingCourse._id] ? (
              <div className="thumbnail-preview">
                <img src={courseThumbnails[editingCourse._id]} alt="Current thumbnail" />
                <p className="thumbnail-caption">Current thumbnail</p>
              </div>
            ) : null}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update Course'}
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (deletingCourse) {
    return (
      <div className="delete-confirmation">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the course "{deletingCourse.title}"?</p>
        <p>This action cannot be undone.</p>
        
        {formError && <div className="error-message">{formError}</div>}
        
        <div className="delete-actions">
          <button 
            className="confirm-delete-btn" 
            onClick={handleConfirmDelete}
            disabled={formLoading}
          >
            {formLoading ? 'Deleting...' : 'Yes, Delete Course'}
          </button>
          <button 
            className="cancel-btn" 
            onClick={handleCancelDelete}
            disabled={formLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-courses-container">
      <h2>My Courses</h2>
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-thumbnail">
                <img 
                  src={courseThumbnails[course._id] || placeholderImage} 
                  alt={course.title} 
                />
              </div>
              <div className="course-header">
                <h3>{course.title}</h3>
              </div>
              <div className="course-body">
                <p className="course-description">{course.description}</p>
                <div className="course-details">
                  <span className="course-detail">
                    <strong>Duration:</strong> {course.duration}
                  </span>
                  <span className="course-detail">
                    <strong>Level:</strong> {course.expertise}
                  </span>
                  <span className="course-detail">
                    <strong>Price:</strong> ₹{course.price}
                  </span>
                </div>
              </div>
              <div className="course-actions">
                <button className="btn edit-btn" onClick={() => handleEditClick(course)}>Edit</button>
                <button className="btn delete-btn" onClick={() => handleDeleteClick(course)}>Delete</button>
                <button className="btn classes-btn" onClick={() => handleManageClassesClick(course)}>
                  Manage Classes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses; 