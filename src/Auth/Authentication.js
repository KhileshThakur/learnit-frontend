import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import AuthHeader from './AuthHeader';
import './Auth.css'

const Authentication = () => {
  const [role, setRole] = useState('Select Role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic 
    console.log('Logging in:', { role, username, password });
  };

  return (
    <div className="full-page">
      <AuthHeader />

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
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <button type="submit" className="login-btn">Authenticate</button>
      </form>
    </div>
  );
};

export default Authentication;
