import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

const EditProfileModal = ({ learner, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    skills: '',
    bio: '',
    linkedin: ''
  });

  useEffect(() => {
    if (learner) {
      setFormData({
        name: learner.name || '',
        gender: learner.gender || '',
        skills: learner.subjects?.join(', ') || '',
        bio: learner.bio || '',
        linkedin: learner.linkedin || ''
      });
    }
  }, [learner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      subjects: formData.skills.split(',').map(sub => sub.trim()),
    };
    onSave(updatedData);
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />

          <div className="gender-options">
            <label><input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} /> Male</label>
            <label><input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} /> Female</label>
            <label><input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} /> Other</label>
          </div>

          <input name="skills" placeholder="Skills (comma separated)" value={formData.skills} onChange={handleChange} />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange}></textarea>
          <input name="linkedin" placeholder="LinkedIn Link" value={formData.linkedin} onChange={handleChange} />

          <div className="modal-buttons">
            <button type="submit" className="btn-edit">Edit</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
