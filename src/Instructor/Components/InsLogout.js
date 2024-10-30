import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InsLogout.css'

const Logout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowWarning(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully', {
      onClose: () => navigate('/')
    });

  };

  const cancelLogout = () => {
    setShowWarning(false);
    
  };
  return (
    <div className="i-logout">
      {showWarning && (
        <div className="logout-warning-modal">
          <h3>Are you sure you want to log out?</h3>
          <p><span>WARNING :</span> <br />Once you log out, you'll be redirected to the homepage, and you'll need to log in again to access your account.</p>
          <div className="i-logout-btn">
            <button onClick={handleLogout} className="confirm-btn">Yes</button>
            <button onClick={cancelLogout} className="cancel-btn">No</button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default Logout
