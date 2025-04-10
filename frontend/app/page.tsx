'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Home() {
  const handleInstagramLogin = async () => {
    try {
      const response = await fetch('http://localhost:3400/api/auth/instagram/url');
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error getting Instagram auth URL:', error);
    }
  };

  return (
    <Container maxWidth="sm">
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
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Instagram Integration
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          Connect your Instagram account to view your profile and media
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<InstagramIcon />}
          onClick={handleInstagramLogin}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.2rem',
            padding: '12px 32px',
          }}
        >
          Login with Instagram
        </Button>
      </Box>
    </Container>
  );
}
