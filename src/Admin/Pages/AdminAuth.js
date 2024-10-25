import React, {useState} from 'react'

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your login logic here, like calling an API or handling form validation
    console.log('Username:', username);
    console.log('Password:', password);
  };
  return (
    <div className="admin-auth-container">
      <form className="admin-auth-form" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn">Login</button>
      </form>
    </div>
  )
}

export default AdminAuth
