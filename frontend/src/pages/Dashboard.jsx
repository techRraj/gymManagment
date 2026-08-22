import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUsers, FaDumbbell, FaMapMarkerAlt, FaTrophy, FaChevronRight, FaBolt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (user) {
      fetchData();
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setError(null);
      const [matchesRes, crewsRes] = await Promise.all([
        api.get('/matches/suggestions'),
        api.get('/crews'),
      ]);
      setMatches(matchesRes.data.matches.slice(0, 6));
      setCrews(crewsRes.data.crews.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="skeleton" style={{ height: '200px', borderRadius: '20px', marginBottom: '2rem' }}></div>
          <div className="stats-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <section className="welcome-banner glass">
          <div className="welcome-content">
            <h1>Let's crush it, <span className="highlight">{user?.name?.split(' ')[0] || 'Athlete'}</span>! 💪</h1>
            <p>Find your perfect training partner or join a crew today.</p>
            <div className="quick-actions">
              <Link to="/matches" className="btn btn-primary"><FaUsers /> Find Matches</Link>
              <Link to="/crews" className="btn btn-secondary"><FaDumbbell /> Browse Crews</Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-icon"><FaBolt /></div>
            <div className="stat-info">
              <div className="stat-value">{matches.length}</div>
              <div className="stat-label">Top Matches</div>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-info">
              <div className="stat-value">{crews.length}</div>
              <div className="stat-label">Active Crews</div>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon"><FaTrophy /></div>
            <div className="stat-info">
              <div className="stat-value">{user?.goals?.length || 0}</div>
              <div className="stat-label">Your Goals</div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-banner glass" style={{ padding: '1rem', borderRadius: '12px', marginBottom: '2rem', color: '#ff4757', border: '1px solid #ff4757' }}>
            {error}
          </div>
        )}

        {/* Matches Section */}
        <section className="content-section">
          <div className="section-header">
            <h2>Top Matches for You</h2>
            <Link to="/matches" className="view-all">View All <FaChevronRight /></Link>
          </div>

          {matches.length === 0 ? (
            <div className="empty-state glass">
              <FaUsers />
              <h3>No matches yet</h3>
              <p>Complete your profile to start finding gym bros!</p>
              <Link to="/profile/me" className="btn btn-primary">Complete Profile</Link>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((match) => (
                <Link to={`/profile/${match.user._id}`} key={match.user._id} className="match-card glass">
                  <div className="match-header">
                    <img 
                    src={
  match.user.avatar?.includes('/uploads/') 
    ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${match.user.avatar}` 
    : (match.user.avatar || `https://ui-avatars.com/api/?name=${match.user.name}&background=00d9ff&color=fff&size=200`)
}
                      alt={match.user.name} 
                      className="match-avatar" 
                    />
                    <span className="match-score">{match.score}%</span>
                  </div>
                  <h3>{match.user.name}</h3>
                  <p className="match-location"><FaMapMarkerAlt /> {match.user.location?.city || 'UK'}</p>
                  <div className="match-goals">
                    {match.user.goals?.slice(0, 2).map(goal => (
                      <span key={goal} className="goal-tag">{goal}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;