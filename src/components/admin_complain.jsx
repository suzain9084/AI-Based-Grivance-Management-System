import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { userContext } from '../context/usercontext';
import { apiUrl, authFetch } from '../utils/api';
import { useGrievanceAudio } from '../utils/useGrievanceAudio';
import { useToast } from '../context/toastcontext';
import { EmptyState, GuestPrompt, LoadingState } from './uiStates';

const departments = [
  'All Departments',
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
];

const categories = [
  'All Categories',
  'Examination',
  'Infrastructure',
  'General Facility',
  'Research Facility',
  'Journals/literature',
  'Fellowship',
];

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

export const GrievanceDialog = ({ open, onClose, grievance, onStatusUpdated }) => {
  const { User } = useContext(userContext);
  const { showToast } = useToast();
  const [status, setStatus] = useState(grievance?.status || 'Pending');
  const [saving, setSaving] = useState(false);
  const { isPlaying, hasAudio, loading: audioLoading, togglePlay } = useGrievanceAudio({
    grievanceId: grievance?.id,
    token: User.token,
    enabled: open,
  });

  useEffect(() => {
    setStatus(grievance?.status || 'Pending');
  }, [grievance?.id, grievance?.status]);

  if (!grievance) return null;

  const getStatusColor = (value) => {
    switch (value) {
      case 'Resolved': return 'success';
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      default: return 'default';
    }
  };

  const handleUpdateStatus = async () => {
    if (!grievance.id || !status || status === grievance.status) return;
    setSaving(true);
    try {
      const res = await authFetch(apiUrl(`/api/admin/update_status/${grievance.id}`), User.token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        const nextStatus = data.status || status;
        showToast('Grievance status updated', 'success');
        onStatusUpdated?.(grievance.id, nextStatus);
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Typography variant="body1" gutterBottom>{grievance.studentName}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.studentId}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1" gutterBottom>{grievance.department}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
            <Typography variant="body1" gutterBottom>{grievance.category}</Typography>

          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1" paragraph sx={{ mt: 1 }}>
              {grievance.description}
            </Typography>
          </Grid>

          <Grid size={12}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Update Status</InputLabel>
              <Select
                label="Update Status"
                value={STATUS_OPTIONS.includes(status) ? status : 'Pending'}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
        <Button
          variant="contained"
          onClick={handleUpdateStatus}
          disabled={saving || !status || status === grievance.status}
        >
          {saving ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminComplain = () => {
  const {User, isLoggedIn} = useContext(userContext)
  const { showToast } = useToast()
  const [mockComplaints,setmockComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'All Categories',
    department: 'All Departments',
    priority: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const getStatusChip = (status) => {
    const statusProps = {
      Resolved: { color: 'success', icon: <CheckCircleIcon /> },
      Pending: { color: 'warning', icon: <WarningIcon /> },
      'In Progress': { color: 'info', icon: <ScheduleIcon /> },
    };

    const { color, icon } = statusProps[status] || { color: 'default', icon: null };

    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
      />
    );
  };

  const filteredComplaints = () => { 
    return mockComplaints.filter((complaint) => {
    return (
      (filters.status === 'all' || complaint.status === filters.status) &&
      (filters.category === 'All Categories' || complaint.category.toLowerCase() === filters.category.toLowerCase()) &&
      (filters.department === 'All Departments' || complaint.department.toLowerCase() === filters.department.toLowerCase()) &&
      (searchQuery === '' ||
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  })};

  const handleGrievanceClick = (grievance) => {
    setSelectedGrievance(grievance);
    setDialogOpen(true);
  };

  const handleStatusUpdated = (grievanceId, nextStatus) => {
    setmockComplaints((prev) =>
      prev.map((item) => (item.id === grievanceId ? { ...item, status: nextStatus } : item))
    );
    setSelectedGrievance((prev) =>
      prev && prev.id === grievanceId ? { ...prev, status: nextStatus } : prev
    );
  };

  const fetch_complains = useCallback(async() => {
    if (!User.admin_id) return;
    setLoading(true);
    try {
      let res = await authFetch(apiUrl("/api/admin/get_all_grievance"), User.token)
      if(res.ok){
        let data = await res.json()
        setmockComplaints(data)
      } else {
        showToast("Failed to load grievances", "error")
      }
    } catch (error) {
      showToast(error.message || "Failed to load grievances", "error")
    } finally {
      setLoading(false)
    }
  }, [User.admin_id, User.token, showToast])

  useEffect(() => {
    fetch_complains();
  }, [fetch_complains]);

  if (!isLoggedIn) {
    return (
      <div className='profile-cont'>
        <GuestPrompt description="Sign in as an admin to review student grievances." />
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
            backgroundColor: 'background.default',
            p: 3,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                Student Grievances
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Add export functionality */ }}
              >
                Export Report
              </Button>
            </Box>

            <Paper sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search by ID, name, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    label="Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={filters.department}
                    label="Department"
                    onChange={handleFilterChange}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={filters.category}
                    label="Category"
                    onChange={handleFilterChange}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Grievance ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <LoadingState label="Loading grievances..." />
                        </TableCell>
                      </TableRow>
                    ) : filteredComplaints().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            title="No grievances found"
                            description="Try adjusting your search or filters."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComplaints()
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((complaint) => (
                        <TableRow key={complaint.id} hover onClick={() => handleGrievanceClick(complaint)} sx={{ cursor: 'pointer' }}>
                          <TableCell>{complaint.id}</TableCell>
                          <TableCell>{complaint.title}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {complaint.studentName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {complaint.studentId}
                            </Typography>
                          </TableCell>
                          <TableCell>{complaint.department}</TableCell>
                          <TableCell>{complaint.category}</TableCell>
                          <TableCell>{getStatusChip(complaint.status)}</TableCell>
                          <TableCell>{complaint.date}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredComplaints().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Container>
        </Box>
        <GrievanceDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          grievance={selectedGrievance}
          onStatusUpdated={handleStatusUpdated}
        />
      </Box>
    </div>
  );
};

export default AdminComplain; 