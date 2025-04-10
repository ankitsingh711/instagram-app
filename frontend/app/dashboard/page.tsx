'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  replies?: Comment[];
}

interface Media {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

interface Profile {
  username: string;
  account_type: string;
  media_count: number;
  profilePicture?: string;
  fullName?: string;
  bio?: string;
}

const API_BASE_URL = 'http://localhost:3400/api';

export default function Dashboard() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('instagram_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
    }
  }, [token, router]);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { token: token! },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: media } = useQuery<{ data: Media[] }>({
    queryKey: ['media'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/media`, {
        headers: { token: token! },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const fetchComments = async (mediaId: string) => {
    const res = await fetch(`${API_BASE_URL}/media/${mediaId}/comments`, {
      headers: { token: token! },
    });
    const data = await res.json();
    setComments(data.data || []);
  };

  const postComment = useMutation({
    mutationFn: async ({ mediaId, message, commentId }: { mediaId: string; message: string; commentId?: string }) => {
      const res = await fetch(`${API_BASE_URL}/media/${mediaId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token!,
        },
        body: JSON.stringify({ message, commentId }),
      });
      return res.json();
    },
    onSuccess: () => {
      setReplyText('');
      setReplyToComment(null);
      if (selectedMedia) {
        fetchComments(selectedMedia.id);
      }
    },
  });

  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
    fetchComments(media.id);
  };

  const handleReply = () => {
    if (!selectedMedia || !replyText) return;
    postComment.mutate({
      mediaId: selectedMedia.id,
      message: replyText,
      commentId: replyToComment || undefined,
    });
  };

  if (!token) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Section */}
      {profile && (
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Avatar
            src={profile.profilePicture}
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            {profile.fullName || profile.username}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {profile.bio}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.media_count} posts • {profile.account_type}
          </Typography>
        </Box>
      )}

      {/* Media Grid */}
      <Grid container spacing={3}>
        {media?.data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card onClick={() => handleMediaClick(item)} sx={{ cursor: 'pointer' }}>
              <CardMedia
                component="img"
                height="300"
                image={item.thumbnail_url || item.media_url}
                alt={item.caption || 'Instagram media'}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.caption || 'No caption'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Comments Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            {comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {comment.username}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {comment.text}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setReplyToComment(comment.id)}
                >
                  Reply
                </Button>
                {comment.replies?.map((reply) => (
                  <Box key={reply.id} sx={{ ml: 4, mt: 1 }}>
                    <Typography variant="subtitle2">
                      {reply.username}
                    </Typography>
                    <Typography variant="body2">
                      {reply.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={replyToComment ? 'Write a reply...' : 'Write a comment...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMedia(null)}>Close</Button>
          <Button onClick={handleReply} variant="contained">
            {replyToComment ? 'Reply' : 'Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 