import React, { useState } from 'react';
import axios from 'axios';
import './CreateCourse.css'; // Import the CSS

const CreateCourse = ({ instructorId }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, thumbnail: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('instructorId', instructorId);
    formData.append('thumbnail', form.thumbnail);

    try {
      const res = await axios.post('http://localhost:5000/api/course/create', formData);
      setMessage('✅ Course created successfully!');
      setForm({ title: '', description: '', category: '', thumbnail: null });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || '❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <h2 className="create-course-title">Create New Course</h2>

      <form className="create-course-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={form.title}
          onChange={handleChange}
          required
          className="create-course-input"
        />

        <textarea
          name="description"
          placeholder="Course Description"
          value={form.description}
          onChange={handleChange}
          required
          className="create-course-textarea"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="create-course-input"
        />

        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="create-course-file"
        />

        <button type="submit" className="create-course-button" disabled={loading}>
          {loading ? (
            <div className="loader"></div>
          ) : (
            'Create Course'
          )}
        </button>
      </form>

      {message && <p className="create-course-message">{message}</p>}
    </div>
  );
};

export default CreateCourse;
