import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Crews from './pages/Crews';
import './styles/index.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Loading GymBrosUK...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* Fixed: Added both /profile and /profile/:id routes */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={user ? <Profile /> : <Navigate to="/login" />} />
        
        <Route path="/matches" element={user ? <Matches /> : <Navigate to="/login" />} />
        <Route path="/crews" element={user ? <Crews /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;