import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './InsDashboard.css';
import EditProfileModal from './EditProfileModal';

const InsDashboard = () => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id: instructorId } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await axios.get(`${backendurl}/instructor/${instructorId}`);
        setInstructor(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [instructorId, backendurl]);

  const handleSave = async (updatedData) => {
    try {
      const formattedData = {
        ...updatedData,
        expertise: Array.isArray(updatedData.expertise)
          ? updatedData.expertise
          : updatedData.expertise.split(',').map(item => item.trim())
      };
  
      const response = await axios.put(`${backendurl}/instructor/${instructorId}`, formattedData);
      
      console.log("PUT Response:", response.data); // 👈 ADD THIS
  
      setInstructor(response.data); // ✅ Updates state
      setShowModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await axios.put(
        `${backendurl}/instructor/${instructorId}/profile-pic`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      setInstructor(response.data);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleRemovePic = async () => {
    try {
      await axios.delete(`${backendurl}/instructor/${instructorId}/profile-pic`);
      setInstructor(prev => ({ ...prev, profilePic: "" }));
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!instructor) return <div>Profile not found.</div>;

  return (
    <div className="dashboard-profile">
      <h2>My Profile</h2>

      <div className="profile-layout">
        <div className="profile-details">
          <p><strong>Name:</strong> {instructor.name}</p>
          <p><strong>Date of Birth:</strong> {new Date(instructor.dob).toLocaleDateString()}</p>
          <p><strong>Phone:</strong> {instructor.phone}</p>
          <p><strong>Email:</strong> {instructor.email}</p>
          <p><strong>Graduation Degree:</strong> {instructor.graduation?.gdegree || 'N/A'}</p>
          <p><strong>Post Graduation Degree:</strong> {instructor.postgraduation?.pdegree || 'N/A'}</p>
          <p><strong>Expertise:</strong> {instructor.expertise ? instructor.expertise.join(', ') : 'N/A'}</p>
          <p><strong>Teaching Experience (Years):</strong> {instructor.teachexp}</p>
          <p><strong>Bio:</strong> {instructor.bio || 'No bio added yet.'}</p>
          {instructor.linkedin && (
            <p><strong>LinkedIn:</strong> <a href={instructor.linkedin} target="_blank" rel="noreferrer">{instructor.linkedin}</a></p>
          )}

          <button className="edit-btn" onClick={() => setShowModal(true)}>Edit Profile</button>
        </div>

        <div className="profile-header">
          <img
            src={instructor.profilePic ? `${backendurl}${instructor.profilePic}` : '/default-profile.png'}
            alt="Profile"
            className="profile-pic"
          />
          <div className="profile-btns">
            <label htmlFor="profile-upload" className="change-btn">Change Profile</label>
            <input type="file" id="profile-upload" style={{ display: 'none' }} onChange={handleProfilePicUpload} />
            {instructor.profilePic && instructor.profilePic !== "/default-profile.png" && (
              <button className="remove-btn" onClick={handleRemovePic}>Remove Profile</button>
            )}
          </div>
        </div>
      </div>

      {showModal && instructor && (
        <EditProfileModal
          key={instructor._id + JSON.stringify(instructor)} // 🔥 forces modal remount
          instructor={instructor}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default InsDashboard;
