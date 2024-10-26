import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthHeader.css';

const AuthHeader = () => {
    const navigate = useNavigate();  
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);  
    };

    return (
        <div className="button-group-container">
            <button 
                onClick={() => handleNavigation('/auth')} 
                className={`auth-btn ${location.pathname === '/auth' ? 'active' : ''}`}
            >
                Authentication
            </button>
            <button 
                onClick={() => handleNavigation('/register-instructor')} 
                className={`auth-btn ${location.pathname === '/register-instructor' ? 'active' : ''}`}
            >
                Join As Instructor
            </button>
            <button 
                onClick={() => handleNavigation('/register-learner')} 
                className={`auth-btn ${location.pathname === '/register-learner' ? 'active' : ''}`}
            >
                Join As Learner
            </button>
        </div>
    );
};

export default AuthHeader;
