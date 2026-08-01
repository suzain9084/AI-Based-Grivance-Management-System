import React, { useState, useEffect } from 'react'
import GrievanceCard from './grievanceCard'
import "../css/grievancelist.css"
import refreshIcon from "/refreash.svg"
import filterIcon from "/filter.svg"
import { useContext } from 'react'
import { userContext } from '../context/usercontext'
import { API_URLS, authFetch } from '../utils/api'
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Close as CloseIcon,
} from '@mui/icons-material';


const Grienvancelist = () => {
  const { User } = useContext(userContext)
  const [grievances, setGrievances] = useState([])
  const [currGrie, setcurrGrie] = useState({})
  const [openDialog, setOpenDialog] = useState(false)

  const get_all_grievance = async () => {
    let res = await authFetch(`${API_URLS.grievance}/get_all_grievance/${User.u_id}`, User.token)
    if (res.ok) {
      res = await res.json()
      setGrievances(res)
    }
  }

  useEffect(() => {
    if (User.u_id) {
      get_all_grievance()
    }
  }, [User])

  return (
    <div className='grievance-list-cont bg-white'>
      <div className='grie-list-header'>
        <div>
          <div className='list-filter'>
            <img src={filterIcon} alt="" />
            <p> Filter </p>
          </div>
          <div>
            <div className='list-refresh'>
              <img src={refreshIcon} alt="" />
              <p> Refresh </p>
            </div>
            <div className='list-search'>
              <input type="search" id="" placeholder='Search Here' className='header-search-input' />
            </div>
          </div>
        </div>
      </div>
      <div className='grie-card-cont'>
        {grievances.map((grievance) => {
          return <GrievanceCard grievance={grievance} setOpenDialog={setOpenDialog} setcurrGrie={setcurrGrie}/>
        })}
      </div>
      <GrievanceDialog
        open={openDialog}
        onClose={() => { setOpenDialog(false) }}
        grievance={currGrie}
      />
    </div>
  )
};

export default Grienvancelist;


const GrievanceDialog = ({ open, onClose, grievance }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(grievance?.audioUrl));
  const { User } = useContext(userContext)

  const handlePlayPause = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setIsPlaying(false));
      audio.pause();
    };
  }, [audio]);

  if (!grievance) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Grievance Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>{grievance.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={grievance.status}
                  color={getStatusColor(grievance.status)}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Grievance ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.id}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
            <Typography variant="body1" gutterBottom>{User.full_name}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.u_id}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1" gutterBottom>{User.department}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
            <Typography variant="body1" gutterBottom>{grievance.c_id}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1" paragraph sx={{ mt: 1 }}>
              {grievance.desc}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'grey.50'
              }}
            >
              <IconButton
                onClick={handlePlayPause}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Audio Recording
                </Typography>
                <Typography variant="body2">
                  Click to {isPlaying ? 'pause' : 'play'} the grievance audio
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};