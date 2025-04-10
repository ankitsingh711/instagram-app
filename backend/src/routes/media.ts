import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get user media
router.get('/', async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Get comments for a media
router.get('/:mediaId/comments', async (req, res) => {
  try {
    const { token } = req.headers;
    const { mediaId } = req.params;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const response = await axios.get(`https://graph.instagram.com/${mediaId}/comments?fields=id,text,timestamp,username,replies{id,text,timestamp,username}&access_token=${token}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Reply to a comment
router.post('/:mediaId/comments', async (req, res) => {
  try {
    const { token } = req.headers;
    const { mediaId } = req.params;
    const { message, commentId } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const endpoint = commentId
      ? `https://graph.instagram.com/${commentId}/replies`
      : `https://graph.instagram.com/${mediaId}/comments`;

    const response = await axios.post(endpoint, {
      message,
      access_token: token,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default router; 