import React, { useState, useEffect, useContext } from 'react';
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
import { API_URLS, authFetch } from '../utils/api';

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

export const GrievanceDialog = ({ open, onClose, grievance }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(grievance?.audioUrl));

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
      maxWidth="md"
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
            <Typography variant="body1" gutterBottom>{grievance.studentName}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
            <Typography variant="body1" gutterBottom>{grievance.studentId}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1" gutterBottom>{grievance.department}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
            <Typography variant="body1" gutterBottom>{grievance.category}</Typography>

          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1" paragraph sx={{ mt: 1 }}>
              {grievance.description}
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

const AdminComplain = () => {
  const {User} = useContext(userContext)
  const [mockComplaints,setmockComplaints] = useState([])
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

  const fetch_complains = async() => {
    let res = await authFetch(`${API_URLS.admin}/get_all_grievance`, User.token)
    if(res.ok){
      let data = await res.json()
      setmockComplaints(data)
    }
  }

  useEffect(() => {
    if (User.admin_id) {
      fetch_complains()
    }
  }, [])

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
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
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
                    { mockComplaints.length > 0 && filteredComplaints()
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((complaint) => (
                        <TableRow key={complaint.id} hover onClick={() => handleGrievanceClick(complaint)}>
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
                      ))}
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
        />
      </Box>
    </div>
  );
};

export default AdminComplain; 