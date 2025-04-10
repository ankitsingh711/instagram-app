'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Avatar, CircularProgress, Card, CardContent, CardMedia, TextField, Button, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3400';

interface Profile {
  username: string;
  account_type: string;
  media_count: number;
  profilePicture?: string;
  fullName?: string;
  bio?: string;
}

interface MediaItem {
  id: string;
  media_type: string;
  media_url: string;
  caption: string;
  timestamp: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; mediaId: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('instagram_token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { token },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      }
    };

    const fetchMedia = async () => {
      try {
        const response = await fetch(`${API_URL}/api/media/feed`, {
          headers: { token },
        });
        if (!response.ok) throw new Error('Failed to fetch media');
        const data = await response.json();
        setMedia(data);
      } catch (err) {
        setError('Failed to load media');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchMedia();
  }, [router]);

  const handleComment = async (mediaId: string) => {
    try {
      const token = localStorage.getItem('instagram_token');
      const response = await fetch(`${API_URL}/api/media/${mediaId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token!,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      // Refresh media to show new comment
      const updatedMedia = await response.json();
      setMedia(media.map(item => 
        item.id === mediaId ? updatedMedia : item
      ));
      setNewComment('');
    } catch (err) {
      console.error(err);
      setError('Failed to post comment');
    }
  };

  const handleReply = async (mediaId: string, commentId: string) => {
    try {
      const token = localStorage.getItem('instagram_token');
      const response = await fetch(`${API_URL}/api/media/${mediaId}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token!,
        },
        body: JSON.stringify({ text: replyText }),
      });

      if (!response.ok) throw new Error('Failed to post reply');
      
      // Refresh media to show new reply
      const updatedMedia = await response.json();
      setMedia(media.map(item => 
        item.id === mediaId ? updatedMedia : item
      ));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      setError('Failed to post reply');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Section */}
      <Box mb={6}>
        <Grid container spacing={4} alignItems="center">
          <Grid {...{ item: true, xs: 12, sm: 3 } as any}>
            <Avatar
              src={profile?.profilePicture}
              sx={{ width: 150, height: 150 }}
            />
          </Grid>
          <Grid {...{ item: true, xs: 12, sm: 9 } as any}>
            <Typography variant="h4" gutterBottom>
              {profile?.username}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {profile?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.bio}
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                {profile?.media_count} posts • {profile?.account_type}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Media Feed */}
      <Grid container spacing={4}>
        {media.map((item) => (
          <Grid {...{ item: true, xs: 12, key: item.id } as any}>
            <Card>
              {item.media_type === 'IMAGE' && (
                <CardMedia
                  component="img"
                  height="500"
                  image={item.media_url}
                  alt={item.caption}
                  sx={{ objectFit: 'contain' }}
                />
              )}
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {item.caption}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Typography>

                {/* Comments Section */}
                <Box mt={2}>
                  {item.comments.map((comment) => (
                    <Box key={comment.id} mb={2}>
                      <Typography variant="body2">
                        <strong>{comment.username}:</strong> {comment.text}
                      </Typography>
                      
                      {/* Replies */}
                      <Box ml={4} mt={1}>
                        {comment.replies.map((reply) => (
                          <Typography key={reply.id} variant="body2" color="text.secondary">
                            <strong>{reply.username}:</strong> {reply.text}
                          </Typography>
                        ))}
                      </Box>

                      {/* Reply Button and Form */}
                      {replyingTo?.commentId === comment.id ? (
                        <Box ml={4} mt={1}>
                          <TextField
                            size="small"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            fullWidth
                            multiline
                            maxRows={3}
                          />
                          <Box mt={1}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleReply(item.id, comment.id)}
                            >
                              Post Reply
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setReplyingTo(null)}
                              sx={{ ml: 1 }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => setReplyingTo({ commentId: comment.id, mediaId: item.id })}
                        >
                          Reply
                        </Button>
                      )}
                    </Box>
                  ))}

                  {/* New Comment Form */}
                  <Box mt={2}>
                    <TextField
                      size="small"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      fullWidth
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleComment(item.id)}
                      sx={{ mt: 1 }}
                    >
                      Post Comment
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 