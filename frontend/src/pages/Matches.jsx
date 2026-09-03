import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaMapMarkerAlt, FaDumbbell, FaUsers, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Matches.css';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null); // Prevents double-clicks

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, requestsRes] = await Promise.all([
        api.get('/matches/suggestions'),
        api.get('/matches/requests'),
      ]);
      setMatches(matchesRes.data.matches || []);
      setRequests(requestsRes.data || { received: [], sent: [] });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
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
    setProcessingId(requestId); // Show loading state on button
    try {
      await api.put(`/matches/request/${requestId}`, { status });
      toast.success(`Request ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
      
      // Optimistically update UI immediately so buttons disappear instantly
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(r => r._id === requestId ? { ...r, status } : r)
      }));
      
      fetchData(); // Refresh in background to ensure sync
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'high') return match.score >= 70;
    if (filter === 'medium') return match.score >= 40 && match.score < 70;
    return true;
  });

  // STRICTLY filter only pending requests
  const pendingReceived = requests.received.filter(r => r.status === 'pending');
  const acceptedMatches = requests.received.filter(r => r.status === 'accepted');

  return (
    <div className="matches-page">
      <div className="matches-container">
        <div className="page-header">
          <h1>Find Your Training Partners</h1>
          <p>Connect with gym enthusiasts who match your goals and schedule</p>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Matches</button>
          <button className={`filter-tab ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>High Match (70%+)</button>
          <button className={`filter-tab ${filter === 'medium' ? 'active' : ''}`} onClick={() => setFilter('medium')}>Medium Match (40%+)</button>
        </div>

        {/* Pending Received Requests (Only shows if status === 'pending') */}
        {pendingReceived.length > 0 && (
          <section className="requests-section">
            <h2>Pending Requests ({pendingReceived.length})</h2>
            <div className="requests-grid">
              {pendingReceived.map(request => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <h3>{request.sender?.name || 'Unknown User'}</h3>
                    <p>{request.message || 'No message'}</p>
                    <span className="match-score">{request.matchScore}% match</span>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleRequest(request._id, 'accepted')}
                      disabled={processingId === request._id}
                    >
                      {processingId === request._id ? '...' : <><FaCheck /> Accept</>}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleRequest(request._id, 'rejected')}
                      disabled={processingId === request._id}
                    >
                      {processingId === request._id ? '...' : <><FaTimes /> Reject</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accepted Matches */}
        {acceptedMatches.length > 0 && (
          <section className="requests-section">
            <h2>Your Active Matches </h2>
            <div className="requests-grid">
              {acceptedMatches.map(request => (
                <div key={request._id} className="request-card accepted">
                  <div className="request-info">
                    <h3>{request.sender?.name || 'Unknown User'}</h3>
                    <p>Location: {request.sender?.location?.city || 'UK'}</p>
                    <span className="match-score accepted-badge">✓ Matched</span>
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
              {filteredMatches.map((match, index) => {
                const existingRequest = [...requests.received, ...requests.sent].find(
                  r => r.sender?._id === match.user._id || r.receiver?._id === match.user._id
                );
                
                return (
                  <motion.div
                    key={match.user._id}
                    className="match-profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="profile-header">
                      <img src={match.user.avatar || `https://ui-avatars.com/api/?name=${match.user.name}&background=00d9ff&color=fff`} alt={match.user.name} />
                      <div className="match-badge">{match.score}%</div>
                    </div>
                    
                    <div className="profile-info">
                      <h3>{match.user.name}</h3>
                      <p className="location"><FaMapMarkerAlt /> {match.user.location?.city || 'UK'}</p>
                      
                      <div className="profile-details">
                        <div className="detail"><FaDumbbell /> {match.user.experience}</div>
                        <div className="detail"><FaUsers /> {match.user.trainingVolume}</div>
                      </div>

                      <div className="goals">
                        {match.user.goals?.map(goal => <span key={goal} className="goal-tag">{goal}</span>)}
                      </div>

                      <div className="actions">
                        {existingRequest ? (
                          existingRequest.status === 'pending' ? (
                            <button className="btn btn-secondary" disabled>
                              <FaHourglassHalf /> Pending
                            </button>
                          ) : existingRequest.status === 'accepted' ? (
                            <button className="btn btn-success" disabled>
                              <FaCheck /> Matched
                            </button>
                          ) : (
                            <button className="btn btn-danger" disabled>
                              <FaTimes /> Declined
                            </button>
                          )
                        ) : (
                          <button className="btn btn-primary" onClick={() => sendRequest(match.user._id)}>
                            Send Request
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Matches;