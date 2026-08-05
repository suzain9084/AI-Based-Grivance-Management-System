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
  RestaurantMenuRounded,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { userContext } from '../context/usercontext';
import { apiUrl, authFetch } from '../utils/api';

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

const QuickActionCard = ({ title, description, icon, action }) => (
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
  const { User, setUser } = useContext(userContext)
  // const stats = [
  //   {
  //     title: 'Total Complaints',
  //     value: '156',
  //     trend: 12,
  //   },
  //   {
  //     title: 'Resolved',
  //     value: '89',
  //     trend: 8,
  //   },
  //   {
  //     title: 'Pending',
  //     value: '67',
  //     trend: -5,
  //   },
  // ];

  const fetch_stats_data = async() =>{
    let res = await authFetch(apiUrl(`/api/grievances/get_data_statcard/${User.u_id}`), User.token)
    if (res.ok) {
      let stats_data = await res.json()
      setstats(stats_data)
    }
  }

  const fetch_recent_acivity_data = async () =>{
    let res = await authFetch(apiUrl(`/api/grievances/kpi_report/${User.u_id}`), User.token)
    if(res.ok){
      let data = await res.json()
      setacivity(data)
    }
  }

  useEffect(() => {
    if(User.u_id){
        fetch_stats_data()
        fetch_recent_acivity_data()
    }
  }, [])
  

  const quickActions = [
    {
      title: 'New Complaint',
      description: 'Submit a new grievance or complaint',
      icon: <Add color="primary" />
    },
  ];

  let desktopOS = () => { 
    return [
          { id: 1, value: stats[0].value, label: 'Total Complain', color: '#9c27b0' },
          { id: 0, value: stats[1].value, label: 'Resolved', color: '#4caf50' },
          { id: 2, value: stats[2].value, label: 'Pending', color: '#1976d2' }
    ]
  };

  const valueFormatter = (value) => `${value}%`;

  return (
    <div className='profile-cont'>
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3.1} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
          {stats.length > 0 && <PieChart
            series={[
              {
                data: desktopOS(),
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                valueFormatter,
              },
            ]}
            height={200}
            width={500} />}
        </Grid>

        <Grid container spacing={3}>
          {activity.length > 0 && <Grid item xs={12} md={8}>
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
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} key={index}>
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