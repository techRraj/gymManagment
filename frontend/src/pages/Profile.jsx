import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaMapMarkerAlt, FaDumbbell, FaEdit, FaSave, FaTimes, FaCamera, FaPaperPlane, FaEnvelope, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

const getAvatarUrl = (user) => {
  if (!user) return `https://ui-avatars.com/api/?name=User&background=00d9ff&color=fff&size=200`;
  if (user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') {
    if (user.avatar.includes('/uploads/') || user.avatar.startsWith('uploads/')) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '').replace(/\/api\//, '/');
      const cleanPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
      return `${backendBaseUrl}${cleanPath}`;
    }
    if (user.avatar.startsWith('http')) return user.avatar;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=00d9ff&color=fff&size=200&bold=true`;
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [matchRequests, setMatchRequests] = useState([]);
  
  // Messaging states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [formData, setFormData] = useState({
    name: '', bio: '', avatar: '', location: { city: '', postcode: '' },
    gymName: '', trainingVolume: '', experience: '', goals: [], availability: []
  });

  const profileId = id === 'me' || !id ? currentUser?._id : id;
  const isOwnProfile = profileId === currentUser?._id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      if (!isOwnProfile) fetchMatchRequests();
    } else {
      setLoading(false);
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile ? '/auth/me' : `/users/${profileId}`;
      const res = await api.get(endpoint);
      const userData = res.data.user || res.data;
      setUser(userData);
      setFormData({
        name: userData.name || '', bio: userData.bio || '', avatar: userData.avatar || '',
        location: userData.location || { city: '', postcode: '' }, gymName: userData.gymName || '',
        trainingVolume: userData.trainingVolume || '', experience: userData.experience || '',
        goals: userData.goals || [], availability: userData.availability || []
      });
      setPreviewUrl(getAvatarUrl(userData));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchMatchRequests = async () => {
    try {
      const res = await api.get('/matches/requests');
      setMatchRequests([...res.data.received, ...res.data.sent]);
    } catch (error) {
      console.error('Fetch requests error:', error);
    }
  };

  const fetchMessages = async () => {
    if (!profileId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/${profileId}`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
      if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('gymName', formData.gymName);
      data.append('trainingVolume', formData.trainingVolume);
      data.append('experience', formData.experience);
      data.append('city', formData.location?.city || '');
      data.append('postcode', formData.location?.postcode || '');
      if (selectedFile) data.append('avatar', selectedFile);

      await api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated successfully! 💪');
      setIsEditing(false);
      setSelectedFile(null);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSendRequest = async () => {
    if (!profileId || isOwnProfile) return;
    setIsSending(true);
    try {
      await api.post('/matches/request', { 
        receiverId: profileId,
        message: `Hey ${user.name}, I saw your profile and would love to train together!` 
      });
      toast.success('Match request sent! 💪');
      fetchMatchRequests();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Request already exists or failed.';
      toast.error(errorMsg); // This will now show "Request already exists" clearly
      fetchMatchRequests(); // Refresh to update button state
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/messages', { receiverId: profileId, content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // ✅ BULLETPROOF Request Status Check (Fixes the 400 error)
  const getRequestStatus = () => {
    if (!currentUser || !user) return null;
    const currentUserId = currentUser._id.toString();
    const profileUserId = user._id.toString();

    const request = matchRequests.find(r => {
      const senderId = r.sender?._id?.toString() || r.sender?.toString();
      const receiverId = r.receiver?._id?.toString() || r.receiver?.toString();
      return (senderId === currentUserId && receiverId === profileUserId) ||
             (senderId === profileUserId && receiverId === currentUserId);
    });
    return request ? request.status : null;
  };

  if (loading) return <div className="loading-screen"><div className="loader"></div><h2>Loading...</h2></div>;
  if (!user) return <div className="error-screen">User not found</div>;

  const requestStatus = getRequestStatus();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header-section">
          <div className="cover-photo">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=600&fit=crop" alt="Cover" />
          </div>
          <div className="profile-header-content">
            <div className="avatar-section">
              <img src={getAvatarUrl(user)} alt={user.name} onError={(e) => { e.target.onerror = null; e.target.src = getAvatarUrl({ name: user.name }); }} />
            </div>
            <div className="header-info">
              <h1>{user.name}</h1>
              {user.experience && <p className="experience-badge">{user.experience}</p>}
              <div className="header-meta">
                {user.location?.city && <span><FaMapMarkerAlt /> {user.location.city}</span>}
                {user.gymName && <span><FaDumbbell /> {user.gymName}</span>}
              </div>
            </div>
            {isOwnProfile && (
              <button className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit Profile</>}
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="info-card">
              <h3>Training Info</h3>
              {formData.trainingVolume && <div className="info-item"><strong>Volume:</strong> {formData.trainingVolume}</div>}
              {formData.goals.length > 0 && (
                <div className="info-item">
                  <strong>Goals:</strong>
                  <div className="goals-list">{formData.goals.map(goal => <span key={goal} className="goal-tag">{goal}</span>)}</div>
                </div>
              )}
            </div>
            <div className="info-card">
              <h3>Stats</h3>
              {user.age && <div className="info-item"><strong>Age:</strong> {user.age}</div>}
              <div className="info-item"><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          <div className="profile-main">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group avatar-upload-group">
                  <label>Profile Photo</label>
                  <div className="avatar-upload-container">
                    <img src={previewUrl || getAvatarUrl(formData)} alt="Preview" className="avatar-preview" />
                    <div className="avatar-input-wrapper">
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}><FaCamera /> Choose from Device</button>
                      <small>JPG, PNG, GIF or WebP. Max 5MB.</small>
                      {selectedFile && <small style={{ color: '#00ff88', marginTop: '0.5rem', display: 'block' }}>✓ {selectedFile.name}</small>}
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                  <div className="form-group"><label>City</label><input type="text" value={formData.location?.city || ''} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Gym Name</label><input type="text" value={formData.gymName || ''} onChange={(e) => setFormData({ ...formData, gymName: e.target.value })} /></div>
                  <div className="form-group">
                    <label>Experience</label>
                    <select value={formData.experience || ''} onChange={(e) => setFormData({ ...formData, experience: e.target.value })}>
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Bio</label><textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows="4" placeholder="Tell us about your fitness journey..." /></div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setSelectedFile(null); setPreviewUrl(''); fetchProfile(); }}><FaTimes /> Cancel</button>
                  <button type="submit" className="btn btn-primary"><FaSave /> Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div className="bio-section">
                  <h3>About Me</h3>
                  <p>{user.bio || 'No bio added yet. Click "Edit Profile" to tell us about yourself!'}</p>
                </div>

                {!isOwnProfile && (
                  <div className="action-buttons">
                    {/* ✅ Smart Button Logic prevents 400 errors */}
                    {requestStatus === 'pending' ? (
                      <button className="btn btn-secondary btn-lg" disabled><FaPaperPlane /> Request Pending</button>
                    ) : requestStatus === 'accepted' ? (
                      <button className="btn btn-success btn-lg" disabled><FaCheck /> Matched!</button>
                    ) : requestStatus === 'rejected' ? (
                      <button className="btn btn-danger btn-lg" disabled>Declined</button>
                    ) : (
                      <button className="btn btn-primary btn-lg" onClick={handleSendRequest} disabled={isSending}>
                        {isSending ? 'Sending...' : <><FaPaperPlane /> Send Match Request</>}
                      </button>
                    )}
                    
                    {/* ✅ Messaging Button (Only works if matched) */}
                    {requestStatus === 'accepted' ? (
                      <button className="btn btn-primary btn-lg" onClick={() => { setShowMessageModal(true); fetchMessages(); }}>
                        <FaEnvelope /> Message
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-lg" disabled title="You must be matched to message">
                        <FaEnvelope /> Match First to Message
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Messaging Modal */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content message-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Messages with {user.name}</h2>
              <button className="close-btn" onClick={() => setShowMessageModal(false)}><FaTimes /></button>
            </div>
            <div className="messages-list">
              {loadingMessages ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)' }}>Loading...</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gray)' }}>No messages yet. Say hi! 👋</p>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender._id === currentUser._id;
                  return (
                    <div key={msg._id} className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." required />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;