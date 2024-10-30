import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SmallLoading from '../../Utility/Components/UI/SmallLoading';

import './InsDashboard.css'

const InsDashboard = () => {
  const backendurl = process.env.REACT_APP_BACKEND;//return localhost:5000/api
  const { id } = useParams();
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        console.log('Backend URL:', backendurl); // Verify backend URL
        console.log('Instructor ID:', id); // Verify instructor ID

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

  if (loading) return <SmallLoading/>;
  if (!instructorData) return <div>Error loading instructor details.</div>;
  return (
    <div>
      <h1>Instructor Dashboard</h1>
      <h2>Welcome, {instructorData.name}</h2>
      <p>Email: {instructorData.email}</p>
      <p>Specialization: {instructorData.specialization}</p>
      {/* Add other fields as needed */}
    </div>
  )
}

export default InsDashboard;
