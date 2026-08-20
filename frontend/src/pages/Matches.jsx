import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaMapMarkerAlt, FaDumbbell, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Matches.css';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, requestsRes] = await Promise.all([
        api.get('/matches/suggestions'),
        api.get('/matches/requests'),
      ]);
      setMatches(matchesRes.data.matches);
      setRequests(requestsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const sendRequest = async (userId, message = '') => {
    try {
      await api.post('/matches/request', { receiverId: userId, message });
      toast.success('Match request sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      await api.put(`/matches/request/${requestId}`, { status });
      toast.success(`Request ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'high') return match.score >= 70;
    if (filter === 'medium') return match.score >= 40 && match.score < 70;
    return true;
  });

  return (
    <div className="matches-page">
      <div className="matches-container">
        <div className="page-header">
          <h1>Find Your Training Partners</h1>
          <p>Connect with gym enthusiasts who match your goals and schedule</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Matches
          </button>
          <button 
            className={`filter-tab ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Match (70%+)
          </button>
          <button 
            className={`filter-tab ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium Match (40%+)
          </button>
        </div>

        {/* Match Requests */}
        {requests.received.length > 0 && (
          <section className="requests-section">
            <h2>Pending Requests</h2>
            <div className="requests-grid">
              {requests.received.map(request => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <h3>{request.sender.name}</h3>
                    <p>{request.message || 'No message'}</p>
                    <span className="match-score">{request.matchScore}% match</span>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => handleRequest(request._id, 'accepted')}
                    >
                      <FaCheck /> Accept
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleRequest(request._id, 'rejected')}
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Matches Grid */}
        <section className="matches-list">
          {loading ? (
            <div className="loading">Loading matches...</div>
          ) : filteredMatches.length === 0 ? (
            <div className="no-matches">
              <FaUsers />
              <h3>No matches found</h3>
              <p>Try adjusting your filters or update your profile</p>
            </div>
          ) : (
            <div className="matches-grid">
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.user._id}
                  className="match-profile-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="profile-header">
                    <img src={match.user.avatar || 'https://i.imgur.com/default.png'} alt={match.user.name} />
                    <div className="match-badge">{match.score}%</div>
                  </div>
                  
                  <div className="profile-info">
                    <h3>{match.user.name}</h3>
                    <p className="location">
                      <FaMapMarkerAlt /> {match.user.location?.city}
                    </p>
                    
                    <div className="profile-details">
                      <div className="detail">
                        <FaDumbbell /> {match.user.experience}
                      </div>
                      <div className="detail">
                        <FaUsers /> {match.user.trainingVolume}
                      </div>
                    </div>

                    <div className="goals">
                      {match.user.goals?.map(goal => (
                        <span key={goal} className="goal-tag">{goal}</span>
                      ))}
                    </div>

                    {match.user.bio && (
                      <p className="bio">{match.user.bio.substring(0, 100)}...</p>
                    )}

                    <div className="actions">
                      <Link to={`/profile/${match.user._id}`} className="btn btn-secondary">
                        View Profile
                      </Link>
                      <button 
                        className="btn btn-primary"
                        onClick={() => sendRequest(match.user._id)}
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Matches;