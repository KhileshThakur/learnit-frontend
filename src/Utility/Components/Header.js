import React from 'react'
import { Link } from 'react-router-dom';
import Logo from '../Images/Logo.png'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/auth">Login</Link>
        <Link to="/register-learner">Join as Learner</Link>
        <Link to="/register-instructor">Join as Instructor</Link>
      </nav>
    </header>
  )
}

export default Header
