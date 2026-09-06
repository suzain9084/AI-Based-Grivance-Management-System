import React, { useState, useEffect, useCallback } from 'react'
import GrievanceCard from './grievanceCard'
import "../css/grievancelist.css"
import refreshIcon from "/refreash.svg"
import { useContext } from 'react'
import { userContext } from '../context/usercontext'
import { apiUrl, authFetch } from '../utils/api'
import { useGrievanceAudio } from '../utils/useGrievanceAudio'
import { useToast } from '../context/toastcontext'
import { EmptyState, GuestPrompt, LoadingState } from './uiStates'
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
  const { User, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()
  const [grievances, setGrievances] = useState([])
  const [currGrie, setcurrGrie] = useState({})
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const get_all_grievance =  useCallback(async () => {
    if (!User.u_id) return;
    setLoading(true);
    try {
      let res = await authFetch(apiUrl(`/api/grievances/get_all_grievance/${User.u_id}`), User.token)
      if (res.ok) {
        let data = await res.json()
        setGrievances(data)
      } else {
        showToast("Failed to load grievances", "error")
      }
    } catch (error) {
      showToast(error.message || "Failed to load grievances", "error")
    } finally {
      setLoading(false)
    }
  }, [User.u_id, User.token, showToast])

  useEffect(() => {
    if (User.u_id) {
      get_all_grievance()
    }
  }, [User.u_id, get_all_grievance])

  const filteredGrievances = grievances.filter((grievance) => {
    const matchesSearch = !searchQuery ||
      grievance.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const status = String(grievance.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='grievance-list-cont'>
      <div className='grie-list-header'>
        <div>
          <select
            className='list-filter'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <div>
            <button className='list-refresh' type="button" onClick={get_all_grievance} disabled={!isLoggedIn || loading}>
              <img src={refreshIcon} alt="" className={loading ? 'spinning' : ''} />
              <p> Refresh </p>
            </button>
            <div className='list-search'>
              <input
                type="search"
                placeholder='Search grievances'
                className='header-search-input'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='grie-card-cont'>
        {!isLoggedIn ? (
          <GuestPrompt description="Sign in to view and track your submitted grievances." />
        ) : loading ? (
          <LoadingState label="Loading your grievances..." />
        ) : filteredGrievances.length === 0 ? (
          <EmptyState
            title={grievances.length === 0 ? "No grievances yet" : "No matching grievances"}
            description={grievances.length === 0 ? "Submit your first grievance to get started." : "Try a different search or filter."}
          />
        ) : (
          filteredGrievances.map((grievance) => (
            <GrievanceCard key={grievance.id} grievance={grievance} setOpenDialog={setOpenDialog} setcurrGrie={setcurrGrie}/>
          ))
        )}
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
  const { User } = useContext(userContext)
  const { isPlaying, hasAudio, loading: audioLoading, togglePlay } = useGrievanceAudio({
    grievanceId: grievance?.id,
    token: User.token,
    enabled: open,
  });

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
        <Typography variant="h6" component="span">Grievance Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={12}>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Grievance ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.id}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
            <Typography variant="body1" gutterBottom>{User.full_name}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.u_id}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1" gutterBottom>{User.department}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
            <Typography variant="body1" gutterBottom>{grievance.c_id}</Typography>
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1" paragraph sx={{ mt: 1 }}>
              {grievance.desc}
            </Typography>
          </Grid>

          <Grid size={12}>
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
                onClick={togglePlay}
                disabled={!hasAudio || audioLoading}
                sx={{
                  bgcolor: hasAudio ? 'primary.main' : 'grey.400',
                  color: 'white',
                  '&:hover': { bgcolor: hasAudio ? 'primary.dark' : 'grey.400' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Audio Recording
                </Typography>
                <Typography variant="body2">
                  {audioLoading
                    ? 'Loading audio...'
                    : hasAudio
                      ? `Click to ${isPlaying ? 'pause' : 'play'} the grievance audio`
                      : 'No audio recording for this grievance'}
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