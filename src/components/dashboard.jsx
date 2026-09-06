import React, { useEffect,useState,useContext } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
} from '@mui/material';
import {
  Report,
  CheckCircle,
  Pending,
  Add,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { userContext } from '../context/usercontext';
import { apiUrl, authFetch } from '../utils/api';
import { useToast } from '../context/toastcontext';
import { GuestPrompt, LoadingState } from './uiStates';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        {title == 'Total Complaints' ? <Report sx={{ color: 'primary.main' }} /> : title == "Resolved" ? <CheckCircle sx={{ color: 'success.main' }} /> : <Pending sx={{ color: 'warning.main' }} /> }
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
        <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 1 }}>
          {Math.abs(trend)}% from last month
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ title, description, action }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {title == 'Total Complaints' ? <Report sx={{ color: 'primary.main' }} /> : title == "Resolved" ? <CheckCircle sx={{ color: 'success.main' }} /> : <Pending sx={{ color: 'warning.main' }} /> }
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary">
        {description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" sx={{color:'white',backgroundColor:'black'}} onClick={action}>Take Action</Button>
    </CardActions>
  </Card>
);

const Dashboard = () => {

  const [stats, setstats] = useState([])
  const [activity, setacivity] = useState([])
  const [loading, setLoading] = useState(false)
  const { User, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const fetch_stats_data = async() =>{
    let res = await authFetch(apiUrl(`/api/grievances/get_data_statcard/${User.u_id}`), User.token)
    if (res.ok) {
      let stats_data = await res.json()
      setstats(stats_data)
      console.log(stats_data)
    } else {
      showToast("Failed to load dashboard stats", "error")
    }
  }

  const fetch_recent_acivity_data = async () =>{
    let res = await authFetch(apiUrl(`/api/grievances/kpi_report/${User.u_id}`), User.token)
    if(res.ok){
      let data = await res.json()
      setacivity(data)
    } else {
      showToast("Failed to load recent activity", "error")
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      if (!User.u_id) return;
      setLoading(true);
      try {
        await Promise.all([fetch_stats_data(), fetch_recent_acivity_data()]);
      } catch (error) {
        showToast(error.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [User.u_id])
  

  const quickActions = [
    {
      title: 'New Complaint',
      description: 'Submit a new grievance or complaint',
      icon: <Add color="primary" />,
      action: () => navigate("/addGrievance"),
    },
  ];

  const getStatValue = (title) => {
    const stat = stats.find((item) => item.title === title);
    return Number(stat?.value) || 0;
  };

  const pieData = [
    { id: 0, value: getStatValue('Resolved'), label: 'Resolved', color: '#4caf50' },
    { id: 1, value: getStatValue('Pending'), label: 'Pending', color: '#1976d2' },
    { id: 2, value: getStatValue('In Progress'), label: 'In Progress', color: '#ff9800' },
  ];

  const valueFormatter = (item) => {
    const value = Number(item?.value ?? item) || 0;
    const total = pieData.reduce((sum, slice) => sum + slice.value, 0);
    const percent = total ? Math.round((value / total) * 100) : 0;
    return `${percent}%`;
  };

  if (!isLoggedIn) {
    return (
      <div className='profile-cont'>
        <GuestPrompt description="Sign in to see your complaint stats and recent activity." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className='profile-cont'>
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className='profile-cont'>
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3.1} sx={{ mb: 4 }}>
          {stats.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary">No dashboard stats available yet.</Typography>
            </Grid>
          )}
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
          {stats.length > 0 && <PieChart
            series={[
              {
                data: pieData,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                valueFormatter,
              },
            ]}
            height={200}
            width={500} />}
        </Grid>

        <Grid container spacing={3}>
          {activity.length > 0 && <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Complaints Resolution Rate</Typography>
                  <Typography variant="body2">{activity[0].value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activity[0].value}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'black',
                    },
                  }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Response Time</Typography>
                  <Typography variant="body2">{activity[1].value} days</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activity[1].value}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>}
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid size={12} key={index}>
                  <QuickActionCard {...action} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Dashboard;