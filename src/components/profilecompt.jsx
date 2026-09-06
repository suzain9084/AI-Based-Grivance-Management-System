import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  School,
  Badge,
  Edit,
  Save,
} from '@mui/icons-material';

import { userContext } from "../context/usercontext.jsx"
import { apiUrl, authFetch } from "../utils/api.js"
import { useToast } from "../context/toastcontext.jsx"
import { GuestPrompt } from "./uiStates.jsx"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { User, setUser, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()

  const [name, setName] = useState(null)
  const [email, setEmail] = useState(null)
  const [phone, setPhone] = useState(null)


  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setName(User.full_name)
    setEmail(User.email)
    setPhone(User.phone)
  }, [isEditing, User, phone, email, name]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      let data = {
        u_id: User.u_id,
        full_name: name,
        email: email,
        phone: phone
      }
      let res = await authFetch(apiUrl("/api/users/update"), User.token, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })

      let resData = await res.json()
      if (res.status == 200) {
        setUser(resData)
        showToast("Changes saved successfully", "success");
      } else {
        showToast("Failed to save changes", "error");
      }
    } catch (error) {
      showToast(error.message || "An error occurred while saving", "error");
    } finally {
      setIsEditing(false);
      setSaving(false);
    }
  }, [User, email, phone, name, setUser, showToast]);

  const handleChange = useCallback((field) => (event) => {
    if (field == 'name') {
      setName(event.target.value)
    } else if (field == 'email') {
      setEmail(event.target.value)
    } else {
      setPhone(event.target.value)
    }
  }, [name, email, phone, User]);

  if (!isLoggedIn) {
    return (
      <div className="profile-cont">
        <GuestPrompt description="Sign in to view and update your profile." />
      </div>
    );
  }

  return (
    <div className="profile-cont">
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Profile
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                {User.full_name && User.full_name.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {User.full_name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {User.department}
              </Typography>
              <Button
                variant="outlined"
                startIcon={isEditing ? <Save /> : <Edit />}
                onClick={isEditing ? handleSave : handleEdit}
                disabled={saving}
                sx={{ mt: 2, backgroundColor: 'black', borderRadius: '10px', color: 'white' }}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={isEditing ? name : User.full_name}
                    onChange={handleChange('name')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? email : User.email}
                    onChange={handleChange('email')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? phone : User.phone}
                    onChange={handleChange('phone')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={User.student_id}
                    disabled
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Academic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={User.department}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText
                    primary="Year"
                    secondary={User.year}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Profile; 