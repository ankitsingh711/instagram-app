'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

const API_BASE_URL = 'http://localhost:3400/api';

export default function InstagramCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.push('/');
      return;
    }

    // Exchange code for access token
    fetch(`${API_BASE_URL}/auth/instagram/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Store token and user data
        localStorage.setItem('instagram_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      })
      .catch((error) => {
        console.error('Error during authentication:', error);
        router.push('/');
      });
  }, [router, searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Authenticating with Instagram...
      </Typography>
    </Box>
  );
} 