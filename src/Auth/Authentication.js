import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AuthHeader from './AuthHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Authentication.css';

const Authentication = () => {
  const navigate = useNavigate();
  const backendurl =process.env.REACT_APP_BACKEND;

  const [role, setRole] = useState('Select Role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = role === 'learner' ? '/learner/auth' : '/instructor/auth';

    try {
      const response = await fetch(`${backendurl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const id = data.id;
        localStorage.setItem('token', data.token);
        
        // Debug log to check the response data
        console.log('Login response data:', data);
        
        // Store user information including role, ensuring name is properly set
        const userData = {
          id: data.id,
          email: email,
          role: role,
          name: data.name // Only use the name from the response
        };
        
        // Debug log to check what we're storing
        console.log('Storing user data:', userData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Logged in successfully', {
          onClose: () => navigate(`/${role}/${id}/dashboard`)
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="full-page">
      <AuthHeader />
      <h4 className="subtitle">Welcome Back! Your Journey to Knowledge Continues Here.</h4>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Select Role" disabled>Select Role</option>
            <option value="learner">Learner</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Authenticate'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Authentication;
