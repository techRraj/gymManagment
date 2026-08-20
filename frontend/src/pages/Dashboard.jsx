import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUsers, FaDumbbell, FaMapMarkerAlt, FaTrophy, FaChevronRight, FaBolt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, crewsRes] = await Promise.all([
        api.get('/matches/suggestions'),
        api.get('/crews'),
      ]);
      setMatches(matchesRes.data.matches.slice(0, 6));
      setCrews(crewsRes.data.crews.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <section className="welcome-banner glass">
          <div className="welcome-content">
            <h1>Let's crush it, <span className="highlight">{user?.name?.split(' ')[0]}</span>! 💪</h1>
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
              <div className="stat-value">{loading ? '-' : matches.length}</div>
              <div className="stat-label">Top Matches</div>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-info">
              <div className="stat-value">{loading ? '-' : crews.length}</div>
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

        {/* Matches Section */}
        <section className="content-section">
          <div className="section-header">
            <h2>Top Matches for You</h2>
            <Link to="/matches" className="view-all">View All <FaChevronRight /></Link>
          </div>

          {loading ? (
            <div className="matches-grid">
              {[1, 2, 3].map(i => <div key={i} className="match-card skeleton" style={{ height: '250px' }}></div>)}
            </div>
          ) : matches.length === 0 ? (
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
                    <img src={match.user.avatar || `https://ui-avatars.com/api/?name=${match.user.name}&background=00d9ff&color=fff`} alt={match.user.name} className="match-avatar" />
                    <span className="match-score">{match.score}%</span>
                  </div>
                  <h3>{match.user.name}</h3>
                  <p className="match-location"><FaMapMarkerAlt /> {match.user.location?.city || 'UK'}</p>
                  <div className="match-goals">
                    {match.user.goals?.slice(0, 2).map(goal => <span key={goal} className="goal-tag">{goal}</span>)}
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