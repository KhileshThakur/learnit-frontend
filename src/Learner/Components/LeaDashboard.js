import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './LeaDashboard.css';
import EditProfileModal from './EditProfileModal';

const LeaDashboard = () => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id: learnerId } = useParams();
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // controls modal

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const response = await axios.get(`${backendurl}/learner/${learnerId}`);
        setLearner(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching learner data:', error);

        setLoading(false);
      }
    };

    fetchLearner();
  }, [learnerId,backendurl]);

  const handleSave = async (updatedData) => {
    try {
      const updatedLearner = {
        ...updatedData,
        subjects: updatedData.skills.split(',').map(skill => skill.trim()),
      };

      const response = await axios.put(`${backendurl}/learner/${learnerId}`, updatedLearner);
      setLearner(response.data);
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
        `${backendurl}/learner/${learnerId}/profile-pic`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      setLearner(response.data);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleRemovePic = async () => {
    try {
      await axios.delete(`${backendurl}/learner/${learnerId}/profile-pic`);
      setLearner(prev => ({ ...prev, profilePic: "" }));
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!learner) return <div>Profile not found.</div>;

  return (
    <div className="dashboard-profile">
  <h2>My Profile</h2>

  <div className="profile-layout">
    <div className="profile-details">
      <p><strong>Name:</strong> {learner.name}</p>
      <p><strong>Email:</strong> {learner.email}</p>
      <p><strong>Phone:</strong> {learner.phone}</p>
      <p><strong>Date of Birth:</strong> {new Date(learner.dob).toLocaleDateString()}</p>
      <p><strong>College:</strong> {learner.college}</p>
      <p><strong>University:</strong> {learner.university}</p>
      <p><strong>Department:</strong> {learner.department}</p>
      <p><strong>Graduation Year:</strong> {learner.gradYear}</p>
      <p><strong>Subjects:</strong> {learner.subjects.join(', ')}</p>
      <p><strong>Bio:</strong> {learner.bio || 'No bio added yet.'}</p>
      {learner.linkedin && (
        <p><strong>LinkedIn:</strong> <a href={learner.linkedin} target="_blank" rel="noreferrer">{learner.linkedin}</a></p>
      )}
      <button className="edit-btn" onClick={() => setShowModal(true)}>Edit Profile</button>
    </div>

    <div className="profile-header">
      <img
        src={learner.profilePic ? `${backendurl}${learner.profilePic}` : '/default-profile.png'}
        alt="Profile"
        className="profile-pic"
      />
      <div className="profile-btns">
        <label htmlFor="profile-upload" className="change-btn">Change Profile</label>
        <input type="file" id="profile-upload" style={{ display: 'none' }} onChange={handleProfilePicUpload} />
        {learner.profilePic && learner.profilePic !== "/default-profile.png" && (
          <button className="remove-btn" onClick={handleRemovePic}>Remove Profile</button>
        )}
      </div>
    </div>
  </div>
  

  {showModal && (
    <EditProfileModal
      learner={learner}
      onClose={() => setShowModal(false)}
      onSave={handleSave}
    />
  )}
</div>

  );
};

export default LeaDashboard;
