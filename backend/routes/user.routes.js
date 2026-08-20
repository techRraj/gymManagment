import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Get all users (for matching)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      isActive: true 
    }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.params.id === 'undefined' || !req.params.id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (handles file uploads)
router.put('/profile', protect, upload.single('avatar'), handleMulterError, async (req, res) => {
  try {
    console.log('📝 Update request received');
    console.log('📁 Uploaded file:', req.file ? req.file.filename : 'None');
    console.log('📦 Request body:', req.body);

    const updateData = { ...req.body };

    // If a new file was uploaded, update the avatar path
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;
      updateData.avatar = avatarPath;
      console.log('✅ Avatar path to save:', avatarPath);
    }

    // Handle nested location object
    if (req.body.city || req.body.postcode) {
      updateData.location = {
        city: req.body.city || req.body.location?.city,
        postcode: req.body.postcode || req.body.location?.postcode,
        coordinates: req.body.location?.coordinates
      };
    }

    // Remove empty fields to prevent overwriting with blanks
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('🔄 Final update data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User updated successfully. Avatar in DB:', user.avatar);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete user account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ⚠️ THIS LINE IS CRITICAL - DO NOT DELETE IT ⚠️
export default router;