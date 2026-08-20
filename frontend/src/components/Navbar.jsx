import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDumbbell, FaUser, FaUsers, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <FaDumbbell className="logo-icon" />
          <span className="logo-text">GymBros<span className="highlight">UK</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <FaDumbbell /> <span>Dashboard</span>
              </Link>
              <Link to="/matches" className="nav-link">
                <FaUser /> <span>Matches</span>
              </Link>
              <Link to="/crews" className="nav-link">
                <FaUsers /> <span>Crews</span>
              </Link>
              <Link to="/profile/me" className="nav-link">
                <FaUser /> <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass">
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/matches" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Matches
              </Link>
              <Link to="/crews" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Crews
              </Link>
              <Link to="/profile/me" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-full">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-full" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;