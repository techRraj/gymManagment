import express from 'express';
import { findMatches, calculateMatchScore } from '../utils/matching.js';
import MatchRequest from '../models/MatchRequest.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendMatchRequestEmail } from '../utils/email.js';

const router = express.Router();

// Get potential matches
router.get('/suggestions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const matches = await findMatches(user, 20);
    res.json({ success: true, matches });
  } catch (error) {
    console.error('Match suggestions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send match request
router.post('/request', protect, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    const existing = await MatchRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    const score = calculateMatchScore(sender, receiver);

    const request = await MatchRequest.create({
      sender: req.user.id,
      receiver: receiverId,
      message: message || '',
      matchScore: score,
    });

    // Send email notification safely (won't crash if email fails)
    try {
      await sendMatchRequestEmail(receiver, sender);
    } catch (emailErr) {
      console.log('ℹ️ Email skipped/failed, but request created:', emailErr.message);
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Match request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my match requests (FIXED POPULATE)
router.get('/requests', protect, async (req, res) => {
  try {
    const received = await MatchRequest.find({ 
      receiver: req.user.id 
    }).populate('sender', 'name email avatar location city goals experience');
    
    const sent = await MatchRequest.find({ 
      sender: req.user.id 
    }).populate('receiver', 'name email avatar location city goals experience');

    res.json({ success: true, received, sent });
  } catch (error) {
    console.error('Get match requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept/reject match request
router.put('/request/:id', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await MatchRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    console.error('Update match request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;