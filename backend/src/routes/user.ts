import express from 'express';
import axios from 'axios';
import { User } from '../models/User';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const response = await axios.get(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${token}`);
    const profileData = response.data;

    // Update user in database
    const user = await User.findOne({ instagramId: profileData.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...profileData,
      profilePicture: user.profilePicture,
      fullName: user.fullName,
      bio: user.bio,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { token } = req.headers;
    const { fullName, bio } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const response = await axios.get(`https://graph.instagram.com/me?fields=id&access_token=${token}`);
    const { id } = response.data;

    const user = await User.findOne({ instagramId: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router; 