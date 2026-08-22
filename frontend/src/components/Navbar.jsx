import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDumbbell, FaUser, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const totalUnread = res.data.conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error('Fetch unread messages error:', error);
    }
  };

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
              <Link to="/messages" className="nav-link" style={{ position: 'relative' }}>
                <FaEnvelope /> 
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="message-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                )}
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

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu glass">
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/matches" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Matches</Link>
              <Link to="/crews" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Crews</Link>
              <Link to="/messages" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Messages {unreadMessages > 0 && `(${unreadMessages})`}
              </Link>
              <Link to="/profile/me" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-full" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;