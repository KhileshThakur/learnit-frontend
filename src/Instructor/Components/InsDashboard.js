import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SmallLoading from '../../Utility/Components/UI/SmallLoading';
import './InsDashboard.css';

const InsDashboard = () => {
  const backendurl = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        console.log('Backend URL:', backendurl);
        console.log('Instructor ID:', id);

        const response = await fetch(`${backendurl}/instructor/${id}`);

        if (!response.ok) throw new Error('Failed to fetch instructor details');

        const data = await response.json();
        setInstructorData(data);
      } catch (error) {
        console.error('Error fetching instructor details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorData();
  }, [id, backendurl]);

  if (loading) return <SmallLoading />;
  if (!instructorData) return <div>Error loading instructor details.</div>;

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <h2>Welcome, {instructorData.name}</h2>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Personal Information</h3>
          <div className="instructor-info">
            <p><strong>Name:</strong> {instructorData.name}</p>
            <p><strong>Email:</strong> {instructorData.email}</p>
            <p><strong>Phone:</strong> {instructorData.phone}</p>
            <p><strong>Expertise:</strong> {instructorData.expertise?.join(', ')}</p>
            <p><strong>Teaching Experience:</strong> {instructorData.teachexp} years</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Quick Links</h3>
          <div className="quick-links">
            <p>Click on "My Courses" in the sidebar to view your courses</p>
            <p>Click on "Create Course" in the sidebar to create a new course</p>
            <p>Click on "Meeting Requests" to view and manage meeting requests</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Statistics</h3>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Active Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Students Enrolled</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Pending Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsDashboard;
