"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();

  // Auto redirect to dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        px: 3,
      }}
    >
      {/* Denied Icon - No red background */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '3rem', color: '#666666' }}>
          🚫
        </Typography>
      </Box>

      {/* Error Message */}
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333333', mb: 2 }}>
        Access Denied
      </Typography>
      
      <Typography variant="h6" color="#666666" paragraph sx={{ mb: 4, maxWidth: 600 }}>
        You don't have the necessary permissions to access this page. 
        Please contact your administrator.
      </Typography>

      {/* Auto redirect message */}
      <Typography variant="body2" color="#999999" sx={{ mt: 2 }}>
        Redirecting to dashboard in a few seconds...
      </Typography>
    </Box>
  );
};

export default UnauthorizedPage;
