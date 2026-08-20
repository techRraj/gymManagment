import { Link } from 'react-router-dom';
import { FaDumbbell, FaUsers, FaBullseye, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: <FaUsers />,
      title: 'Find Your Crew',
      description: 'Connect with like-minded gym enthusiasts in your area. Build your perfect training crew of up to 4 members.',
    },
    {
      icon: <FaBullseye />,
      title: 'Smart Matching',
      description: 'Our algorithm matches you based on goals, availability, location, and training style for maximum compatibility.',
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Local Partners',
      description: 'Find training partners near you. Filter by distance, gym location, and preferred training times.',
    },
    {
      icon: <FaDumbbell />,
      title: 'Track Progress',
      description: 'Stay accountable with your crew. Share workouts, celebrate gains, and crush your fitness goals together.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Members' },
    { number: '5K+', label: 'Crews Formed' },
    { number: '50+', label: 'UK Cities' },
    { number: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop" 
            alt="Gym Background" 
            className="hero-image"
          />
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Find Your Perfect
              <span className="gradient-text"> Training Partner</span>
            </h1>
            <p className="hero-subtitle">
              Join the UK's fastest-growing gym community. Connect with local lifters, 
              form crews, and crush your fitness goals together.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Your Journey <FaChevronRight />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Already a Member?
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero-stats">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Why Choose GymBrosUK?</h2>
            <p className="section-subtitle">
              We're more than just a platform – we're a community dedicated to helping you achieve your fitness goals.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-bg">
          <img 
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&h=1080&fit=crop" 
            alt="CTA Background"
          />
          <div className="cta-overlay"></div>
        </div>
        <div className="cta-content">
          <h2>Ready to Transform Your Workouts?</h2>
          <p>Join thousands of gym enthusiasts across the UK. Your perfect training partner is waiting.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started Free <FaChevronRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <FaDumbbell className="footer-icon" />
              <span className="footer-text">GymBros<span className="highlight">UK</span></span>
            </div>
            <p className="footer-tagline">Find your crew. Crush your goals.</p>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
            <p className="copyright">© 2026 GymBrosUK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;