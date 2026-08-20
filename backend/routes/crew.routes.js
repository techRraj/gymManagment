import express from 'express';
import Crew from '../models/Crew.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create crew
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, location, maxMembers, goals } = req.body;

    // Check if user is already in a crew
    const existingUser = await User.findById(req.user.id);
    if (existingUser.crewId) {
      return res.status(400).json({ message: 'You are already in a crew. Leave it first.' });
    }

    const crew = await Crew.create({
      name,
      description,
      location: location || { city: 'UK' }, // Default location if missing
      maxMembers: maxMembers || 4,
      goals: goals || [],
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'founder' }],
    });

    // Update user's crewId
    await User.findByIdAndUpdate(req.user.id, { crewId: crew._id });

    res.status(201).json({ success: true, crew });
  } catch (error) {
    console.error('Create crew error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all crews
router.get('/', protect, async (req, res) => {
  try {
    const crews = await Crew.find({ isActive: true })
      .populate('members.user', 'name avatar location')
      .populate('createdBy', 'name avatar');
    res.json({ success: true, crews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join crew
router.post('/:id/join', protect, async (req, res) => {
  try {
    const crew = await Crew.findById(req.params.id);
    
    if (!crew) {
      return res.status(404).json({ message: 'Crew not found' });
    }

    // Check if already a member (Convert both to string for safe comparison)
    const isMember = crew.members.some(m => m.user.toString() === req.user.id.toString());
    
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this crew' });
    }

    if (crew.members.length >= crew.maxMembers) {
      return res.status(400).json({ message: 'Crew is full' });
    }

    // Add member
    crew.members.push({ user: req.user.id, role: 'member' });
    await crew.save();

    // Update user's crewId
    await User.findByIdAndUpdate(req.user.id, { crewId: crew._id });

    res.json({ success: true, crew });
  } catch (error) {
    console.error('Join crew error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave crew
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const crew = await Crew.findById(req.params.id);
    if (!crew) {
      return res.status(404).json({ message: 'Crew not found' });
    }

    // Remove member
    crew.members = crew.members.filter(m => m.user.toString() !== req.user.id.toString());
    
    // If founder leaves, delete crew or assign new founder (simple version: delete if empty)
    if (crew.members.length === 0) {
      await Crew.findByIdAndDelete(req.params.id);
    } else {
      await crew.save();
    }

    await User.findByIdAndUpdate(req.user.id, { crewId: null });

    res.json({ success: true, message: 'Left crew successfully' });
  } catch (error) {
    console.error('Leave crew error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;