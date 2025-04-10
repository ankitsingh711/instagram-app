import express from 'express';
import axios from 'axios';
import { User } from '../models/User';

const router = express.Router();

// Instagram login URL
router.get('/instagram/url', (req, res) => {
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
  res.json({ url: instagramAuthUrl });
});

// Instagram callback
router.post('/instagram/callback', async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code,
    });

    const { access_token, user_id } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`);
    const { username } = profileResponse.data;

    // Create or update user in database
    let user = await User.findOne({ instagramId: user_id });
    if (!user) {
      user = new User({
        instagramId: user_id,
        username,
        accessToken: access_token,
      });
    } else {
      user.accessToken = access_token;
    }
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        instagramId: user.instagramId,
      },
      token: access_token,
    });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router; 