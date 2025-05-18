import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

const EditProfileModal = ({ instructor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    expertise: '',
    teachexp: '',
    linkedin: '',
    bio: ''
  });

  useEffect(() => {
    if (instructor) {
      setFormData({
        name: instructor.name || '',
        phone: instructor.phone || '',
        email: instructor.email || '',
        expertise: Array.isArray(instructor.expertise) ? instructor.expertise.join(', ') : instructor.expertise || '',
        teachexp: instructor.teachexp || '',
        linkedin: instructor.linkedin || '',
        bio: instructor.bio || ''
      });
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      expertise: formData.expertise.split(',').map(s => s.trim())
    };
    onSave(updatedData);
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="expertise" placeholder="Expertise (comma separated)" value={formData.expertise} onChange={handleChange} />
          <input name="teachexp" placeholder="Teaching Experience (Years)" value={formData.teachexp} onChange={handleChange} />
          <input name="linkedin" placeholder="LinkedIn" value={formData.linkedin} onChange={handleChange} />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange}></textarea>

          <div className="modal-buttons">
            <button type="submit" disabled={!formData.name || !formData.email} className="btn-edit">Save</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
