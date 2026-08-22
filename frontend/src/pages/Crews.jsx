import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUsers, FaMapMarkerAlt, FaPlus, FaSearch, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Crews.css';

const Crews = () => {
  const { user: currentUser } = useAuth();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCrew, setNewCrew] = useState({
    name: '', description: '', city: '', gymName: '', maxMembers: 4, goals: [],
  });

  const goals = ['strength', 'hypertrophy', 'powerlifting', 'weightloss', 'endurance', 'general'];

  useEffect(() => {
    fetchCrews();
  }, []);

  const fetchCrews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crews');
      setCrews(res.data.crews);
    } catch (error) {
      toast.error('Failed to load crews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crews', newCrew);
      toast.success('Crew created successfully! 🎉');
      setShowCreateModal(false);
      setNewCrew({ name: '', description: '', city: '', gymName: '', maxMembers: 4, goals: [] });
      fetchCrews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create crew');
    }
  };

  const handleJoin = async (crewId) => {
    try {
      await api.post(`/crews/${crewId}/join`);
      toast.success('Joined crew successfully! 💪');
      fetchCrews();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to join crew';
      toast.error(errorMsg);
    }
  };

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crews-page">
      <div className="crews-container">
        <div className="page-header">
          <h1>Find or Create a Crew</h1>
          <p>Join a training crew or create your own to maximize your gains</p>
        </div>

        <div className="crews-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search crews by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create Crew
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading crews...</div>
        ) : (
          <div className="crews-grid">
            {filteredCrews.map((crew, index) => {
              // Check if current user is already in this crew
              const isMember = crew.members.some(m => 
                m.user?._id === currentUser?._id || m.user === currentUser?._id
              );
              const isFull = crew.members.length >= crew.maxMembers;

              return (
                <motion.div
                  key={crew._id}
                  className="crew-card-large"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="crew-card-header">
                    <div>
                      <h3>{crew.name}</h3>
                      <span className={`crew-status ${isMember ? 'joined' : ''}`}>
                        {crew.members.length}/{crew.maxMembers} members
                      </span>
                    </div>
                    <div className="crew-icon"><FaUsers /></div>
                  </div>

                  <p className="crew-desc">{crew.description}</p>

                  <div className="crew-meta">
                    <span><FaMapMarkerAlt /> {crew.location?.city || 'UK'}</span>
                    {crew.location?.gymName && <span>{crew.location.gymName}</span>}
                  </div>

                  <div className="crew-goals">
                    {crew.goals?.map(goal => (
                      <span key={goal} className="goal-tag">{goal}</span>
                    ))}
                  </div>

                  <div className="crew-members-preview">
                    {crew.members.slice(0, 4).map((member, i) => (
                      <img
                        key={i}
                        src={member.user?.avatar || `https://ui-avatars.com/api/?name=${member.user?.name || 'U'}&background=00d9ff&color=fff`}
                        alt={member.user?.name}
                        title={member.user?.name}
                      />
                    ))}
                  </div>

                  {/* Smart Button Logic */}
                  {isMember ? (
                    <button className="btn btn-success btn-full" disabled>
                      <FaCheck /> Joined
                    </button>
                  ) : isFull ? (
                    <button className="btn btn-secondary btn-full" disabled>
                      Crew Full
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-full" onClick={() => handleJoin(crew._id)}>
                      Join Crew
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Crew Modal (Keep your existing modal code here) */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Create Your Crew</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Crew Name</label>
                  <input type="text" value={newCrew.name} onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newCrew.description} onChange={(e) => setNewCrew({ ...newCrew, description: e.target.value })} rows="3" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={newCrew.city} onChange={(e) => setNewCrew({ ...newCrew, city: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Max Members</label>
                    <select value={newCrew.maxMembers} onChange={(e) => setNewCrew({ ...newCrew, maxMembers: parseInt(e.target.value) })}>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Crew</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Crews;