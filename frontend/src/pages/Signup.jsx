import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaMapMarkerAlt, FaDumbbell } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male',
    city: '',
    postcode: '',
    gymName: '',
    goals: [],
    trainingVolume: '3-4x/week',
    experience: 'intermediate',
    availability: [],
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const goals = ['strength', 'hypertrophy', 'powerlifting', 'weightloss', 'endurance', 'general'];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const times = ['morning', 'afternoon', 'evening', 'night'];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

    const handleAvailabilityToggle = (day, time) => {
    setFormData(prev => {
      const exists = prev.availability.some(a => a.day === day && a.time === time);
      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter(a => !(a.day === day && a.time === time))
        };
      } else {
        return {
          ...prev,
          availability: [...prev.availability, { day, time }]
        };
      }
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Prepare data, ensuring age is a Number (or undefined if blank)
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        location: { 
          city: formData.city, 
          postcode: formData.postcode 
        },
      };

      console.log(' Sending signup payload:', payload);
      
      await signup(payload);
      
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Signup failed:', error);
      // Extract the exact error message from the backend
      const errorMsg = error.response?.data?.message || error.message || 'Signup failed. Please check your details.';
      toast.error(errorMsg);
    } finally {
      // This ensures the button ALWAYS unlocks, even if there's an error
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img 
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop" 
          alt="Gym Background"
        />
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card signup-card">
          <div className="auth-header">
            <FaDumbbell className="auth-icon" />
            <h1>Join GymBrosUK</h1>
            <p>Create your account and find your perfect training partner</p>
          </div>

          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <>
                <div className="form-group">
                  <label><FaUser /> Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FaEnvelope /> Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FaLock /> Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FaLock /> Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-primary btn-full" onClick={() => setStep(2)}>
                  Next Step
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25"
                      min="16"
                      max="80"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label><FaMapMarkerAlt /> City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="London"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Postcode</label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div className="form-group">
                  <label><FaDumbbell /> Gym Name</label>
                  <input
                    type="text"
                    value={formData.gymName}
                    onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                    placeholder="PureGym London"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                    Next Step
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-group">
                  <label>Training Goals (Select all that apply)</label>
                  <div className="checkbox-grid">
                    {goals.map(goal => (
                      <label key={goal} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                        />
                        <span className="checkbox-custom"></span>
                        {goal.charAt(0).toUpperCase() + goal.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Training Volume</label>
                  <select
                    value={formData.trainingVolume}
                    onChange={(e) => setFormData({ ...formData, trainingVolume: e.target.value })}
                  >
                    <option value="2-3x/week">2-3 times per week</option>
                    <option value="3-4x/week">3-4 times per week</option>
                    <option value="5-6x/week">5-6 times per week</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3-5 years)</option>
                    <option value="elite">Elite (5+ years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <div className="availability-grid">
                    {days.map(day => (
                      <div key={day} className="day-section">
                        <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                        <div className="time-options">
                          {times.map(time => (
                            <label key={time} className="time-label">
                              <input
                                type="checkbox"
                                checked={formData.availability.some(a => a.day === day && a.time === time)}
                                onChange={() => handleAvailabilityToggle(day, time)}
                              />
                              <span className="time-custom"></span>
                              {time}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself, your fitness journey, and what you're looking for in a training partner..."
                    rows="4"
                    maxlength="500"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;