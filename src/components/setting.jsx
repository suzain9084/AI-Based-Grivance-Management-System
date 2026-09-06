import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { userContext } from '../context/usercontext';
import { useToast } from '../context/toastcontext';
import { GuestPrompt } from './uiStates';

const Settings = () => {
  const { isLoggedIn } = useContext(userContext);
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  });

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const handleChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.value,
    });
  };

  const handleSave = () => {
    showToast("Settings saved successfully", "success");
  };

  if (!isLoggedIn) {
    return (
      <div className="profile-cont">
        <GuestPrompt description="Sign in to manage your notification and appearance settings." />
      </div>
    );
  }

  return (
    <div className="profile-cont">
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications about your complaints"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications}
                      onChange={() => handleToggle('notifications')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'black',
                        },
                        '& .MuiSwitch-thumb': {
                          color: 'black',
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email Updates"
                    secondary="Receive email notifications about complaint status"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.emailUpdates}
                      onChange={() => handleToggle('emailUpdates')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'black',
                        },
                        '& .MuiSwitch-thumb': {
                          color: 'black',
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Switch between light and dark theme"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.darkMode}
                      onChange={() => handleToggle('darkMode')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'black',
                        },
                        '& .MuiSwitch-thumb': {
                          color: 'black',
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Language & Region
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={handleChange('language')}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                      <MenuItem value="mr">Marathi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="Timezone"
                      onChange={handleChange('timezone')}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="IST">IST (India)</MenuItem>
                      <MenuItem value="EST">EST (Eastern Time)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{backgroundColor:"black"}}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>

  );
};

export default Settings; 