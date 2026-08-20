import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaUsers, FaMapMarkerAlt, FaPlus, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Crews.css';

const Crews = () => {
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCrew, setNewCrew] = useState({
    name: '',
    description: '',
    city: '',
    gymName: '',
    maxMembers: 4,
    goals: [],
  });

  const goals = ['strength', 'hypertrophy', 'powerlifting', 'weightloss', 'endurance', 'general'];

  useEffect(() => {
    fetchCrews();
  }, []);

  const fetchCrews = async () => {
    try {
      const res = await api.get('/crews');
      setCrews(res.data.crews);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load crews');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crews', newCrew);
      toast.success('Crew created successfully!');
      setShowCreateModal(false);
      setNewCrew({ name: '', description: '', city: '', gymName: '', maxMembers: 4, goals: [] });
      fetchCrews();
    } catch (error) {
      toast.error('Failed to create crew');
    }
  };

    const handleJoin = async (crewId) => {
    try {
      await api.post(`/crews/${crewId}/join`);
      toast.success('Joined crew successfully! ');
      fetchCrews();
    } catch (error) {
      // Extract the specific error message from the backend (e.g., "You are already a member")
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
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create Crew
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading crews...</div>
        ) : (
          <div className="crews-grid">
            {filteredCrews.map((crew, index) => (
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
                    <span className="crew-status">
                      {crew.members.length}/{crew.maxMembers} members
                    </span>
                  </div>
                  <div className="crew-icon">
                    <FaUsers />
                  </div>
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
                      src={member.user?.avatar || 'https://i.imgur.com/default.png'}
                      alt={member.user?.name}
                      title={member.user?.name}
                    />
                  ))}
                </div>

                <button
                  className={`btn btn-full ${crew.members.length >= crew.maxMembers ? 'btn-disabled' : 'btn-primary'}`}
                  onClick={() => handleJoin(crew._id)}
                  disabled={crew.members.length >= crew.maxMembers}
                >
                  {crew.members.length >= crew.maxMembers ? 'Crew Full' : 'Join Crew'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Crew Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Create Your Crew</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Crew Name</label>
                  <input
                    type="text"
                    value={newCrew.name}
                    onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                    placeholder="e.g., London Lifters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newCrew.description}
                    onChange={(e) => setNewCrew({ ...newCrew, description: e.target.value })}
                    placeholder="Describe your crew's goals and training style..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={newCrew.city}
                      onChange={(e) => setNewCrew({ ...newCrew, city: e.target.value })}
                      placeholder="London"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gym Name</label>
                    <input
                      type="text"
                      value={newCrew.gymName}
                      onChange={(e) => setNewCrew({ ...newCrew, gymName: e.target.value })}
                      placeholder="PureGym"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Max Members</label>
                  <select
                    value={newCrew.maxMembers}
                    onChange={(e) => setNewCrew({ ...newCrew, maxMembers: parseInt(e.target.value) })}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Training Goals</label>
                  <div className="checkbox-grid">
                    {goals.map(goal => (
                      <label key={goal} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newCrew.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCrew({ ...newCrew, goals: [...newCrew.goals, goal] });
                            } else {
                              setNewCrew({ ...newCrew, goals: newCrew.goals.filter(g => g !== goal) });
                            }
                          }}
                        />
                        <span className="checkbox-custom"></span>
                        {goal}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Crew
                  </button>
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