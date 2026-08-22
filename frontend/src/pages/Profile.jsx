import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaMapMarkerAlt, FaDumbbell, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

// Helper to get avatar URL (handles local uploads and external URLs)
// Helper to get avatar URL (handles local uploads and external URLs)
const getAvatarUrl = (user) => {
  if (!user) return `https://ui-avatars.com/api/?name=User&background=00d9ff&color=fff&size=200`;
  
  if (user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') {
    // Check if it's a local upload path (with or without leading slash)
    if (user.avatar.includes('/uploads/') || user.avatar.startsWith('uploads/')) {
      // Get the API URL from env, or fallback to localhost
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Strip '/api' from the end to get the base backend URL for static files
      const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '').replace(/\/api\//, '/');
      
      // Ensure the path starts with exactly one slash
      const cleanPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
      
      return `${backendBaseUrl}${cleanPath}`;
    }
    
    // If it's already a full external URL (http or https), return it as is
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
  }
  
  // Fallback to initials avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=00d9ff&color=fff&size=200&bold=true`;
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    location: { city: '', postcode: '' },
    gymName: '',
    trainingVolume: '',
    experience: '',
    goals: [],
    availability: []
  });

  // Determine which profile to show
  const profileId = id === 'me' || !id ? currentUser?._id : id;
  const isOwnProfile = profileId === currentUser?._id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
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
        name: userData.name || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        location: userData.location || { city: '', postcode: '' },
        gymName: userData.gymName || '',
        trainingVolume: userData.trainingVolume || '',
        experience: userData.experience || '',
        goals: userData.goals || [],
        availability: userData.availability || []
      });
      setPreviewUrl(getAvatarUrl(userData));
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Instant preview
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
      
      if (selectedFile) {
        data.append('avatar', selectedFile);
      }

      // 1. Send the update to the backend
      const response = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // 2. ✨ NEW: Update the global context with the fresh data from the backend
      if (updateUser && response.data.user) {
        updateUser(response.data.user);
      }
      
      toast.success('Profile updated successfully! 💪');
      setIsEditing(false);
      setSelectedFile(null);
      fetchProfile();
    } catch (error) {
      console.error('Update error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (!user) {
    return <div className="error-screen">User not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header-section">
          <div className="cover-photo">
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=600&fit=crop" 
              alt="Cover" 
            />
          </div>
          
          <div className="profile-header-content">
            <div className="avatar-section">
              <img 
                src={getAvatarUrl(user)} 
                alt={user.name}
                onError={(e) => {
                  console.error('❌ Failed to load header avatar:', e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=00d9ff&color=fff&size=200&bold=true`;
                }}
                onLoad={() => {
                  console.log('✅ Header avatar loaded successfully');
                }}
              />
            </div>
            
            <div className="header-info">
              <h1>{user.name}</h1>
              {user.experience && (
                <p className="experience-badge">{user.experience}</p>
              )}
              <div className="header-meta">
                {user.location?.city && (
                  <span><FaMapMarkerAlt /> {user.location.city}</span>
                )}
                {user.gymName && (
                  <span><FaDumbbell /> {user.gymName}</span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <button 
                className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <><FaSave /> Save Changes</> : <><FaEdit /> Edit Profile</>}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="info-card">
              <h3>Training Info</h3>
              {formData.trainingVolume && (
                <div className="info-item">
                  <strong>Volume:</strong> {formData.trainingVolume}
                </div>
              )}
              {formData.goals.length > 0 && (
                <div className="info-item">
                  <strong>Goals:</strong>
                  <div className="goals-list">
                    {formData.goals.map(goal => (
                      <span key={goal} className="goal-tag">{goal}</span>
                    ))}
                  </div>
                </div>
              )}
              {formData.availability.length > 0 && (
                <div className="info-item">
                  <strong>Availability:</strong>
                  <div className="availability-list">
                    {formData.availability.slice(0, 5).map((av, i) => (
                      <span key={i} className="avail-tag">
                        {av.day} {av.time}
                      </span>
                    ))}
                    {formData.availability.length > 5 && (
                      <span className="avail-tag">+{formData.availability.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>Stats</h3>
              {user.age && (
                <div className="info-item">
                  <strong>Age:</strong> {user.age}
                </div>
              )}
              <div className="info-item">
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="profile-main">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="edit-form">
                
                {/* File Upload Section */}
                <div className="form-group avatar-upload-group">
    <label>Profile Photo</label>
    <div className="avatar-upload-container">
      {/* Preview Image */}
      <img 
        src={previewUrl || getAvatarUrl(formData)} 
        alt="Preview" 
        className="avatar-preview"
      />
      
      <div className="avatar-input-wrapper">
        {/* HIDDEN File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hidden from view
        />
        
        {/* VISIBLE Button that triggers the hidden input */}
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => fileInputRef.current?.click()}
        >
          <FaCamera /> Choose from Device
        </button>
        
        <small>JPG, PNG, GIF or WebP. Max 5MB.</small>
        {selectedFile && (
          <small style={{ color: '#00ff88', marginTop: '0.5rem', display: 'block' }}>
            ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </small>
        )}
      </div>
    </div>
  </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.location?.city || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Gym Name</label>
                    <input
                      type="text"
                      value={formData.gymName || ''}
                      onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience</label>
                    <select
                      value={formData.experience || ''}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="4"
                    placeholder="Tell us about your fitness journey..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setPreviewUrl('');
                      fetchProfile();
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaSave /> Save Changes
                  </button>
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
                    <button className="btn btn-primary btn-lg">
                      Send Match Request
                    </button>
                    <button className="btn btn-secondary btn-lg">
                      Message
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;