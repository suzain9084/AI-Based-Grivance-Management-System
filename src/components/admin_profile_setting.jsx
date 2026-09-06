import React, { useContext, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { userContext } from '../context/usercontext';
import { useToast } from '../context/toastcontext';
import { GuestPrompt } from './uiStates';
import { apiUrl, authFetch } from '../utils/api';


const AdminProfileSettings = () => {
  const { User, setUser, isLoggedIn } = useContext(userContext);
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: User.full_name || '',
    email: User.email || '',
    phone: User.phone || '',
    commitee: User.committee || User.department || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(apiUrl("/api/admin/update"), User.token, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: User.admin_id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      const resData = await res.json();
      if (res.status === 200) {
        setUser({ ...User, ...resData });
        showToast("Profile updated successfully", "success");
        setIsEditing(false);
      } else {
        showToast(resData.message || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className='profile-cont'>
        <GuestPrompt description="Sign in as an admin to manage your profile." />
      </div>
    );
  }

  return (
    <div className='profile-cont'>
    <Box sx={{ display: 'flex' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'auto',
          backgroundColor: 'transparent',
          p: 1,
        }}
      >
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #ece4d4', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Profile Settings
              </Typography>
              <Button
                variant="contained"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                disabled={saving}
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                sx={{ backgroundColor: '#111827' }}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: '#111827',
                  fontSize: '2.4rem',
                }}
              >
                {(User.full_name || 'A').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{User.full_name}</Typography>
              <Typography color="text.secondary">Administrator</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Committee"
                    name="commitee"
                    value={formData.commitee}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
    </div>
  );
};

export default AdminProfileSettings;
