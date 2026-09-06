import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  Report,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Pending
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { userContext } from '../context/usercontext';
import { apiUrl, authFetch } from '../utils/api';
import { useToast } from '../context/toastcontext';
import { GuestPrompt, LoadingState } from './uiStates';

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

const MetricCard = ({ title, value, color }) => (
  <Paper
    elevation={1}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);


const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('6');
  const [reportType, setReportType] = useState('All Complaints');
  const [categoryData, setcategoryData] = useState([])
  const { User, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()
  const [stateCard, setstateCard] = useState([])
  const [monthlyData, setmonthlyData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch_bar_plot_data = async () => {
    let res = await authFetch(apiUrl(`/api/admin/grievanceCategory/${reportType}/${timeRange}`), User.token)
    if (res.ok) {
      let data = await res.json()
      setcategoryData(data)
    }
  }

  const fetch_state_card_data = async () => {
    let res = await authFetch(apiUrl("/api/admin/get_data_statcard"), User.token)
    if (res.ok) {
      let data = await res.json()
      setstateCard(data)
    }
  }

  const fetch_monthly_data = async() => {
    let res = await authFetch(apiUrl(`/api/admin/get_line_graph_data/${timeRange}`), User.token)
    if (res.ok) {
      let data = await res.json()
      setmonthlyData(data)
    }
  }

  useEffect(() => {
    const loadAdminDashboard = async () => {
      if (!User.admin_id) return;
      setLoading(true);
      try {
        await Promise.all([
          fetch_bar_plot_data(),
          fetch_state_card_data(),
          fetch_monthly_data(),
        ]);
      } catch (error) {
        showToast(error.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    loadAdminDashboard();
  }, [timeRange, reportType, User.admin_id])

  const get_range_of_values = () => {
    if (categoryData.length > 0) {
      const values = categoryData.map(item => item.complaints);
      let max_val = Math.max(...values)
      return [
        0,
        Math.floor(max_val / 6),
        Math.floor(max_val / 5),
        Math.floor(max_val / 4),
        Math.floor(max_val / 3),
        Math.floor(max_val / 2),
        max_val
      ];
    }
  }

  if (!isLoggedIn) {
    return (
      <div className='profile-cont'>
        <GuestPrompt description="Sign in as an admin to view grievance analytics." />
      </div>
    );
  }

  return (
    <div className='profile-cont'>
      <Container maxWidth="xl" sx={{ height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="6">Last 6 Months</MenuItem>
                <MenuItem value="3">Last 3 Months</MenuItem>
                <MenuItem value="1">Last Month</MenuItem>
                <MenuItem value="12">Last Year</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="All Complaints">All Complaints</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{ textTransform: 'uppercase' }}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {loading && <LoadingState label="Loading analytics..." />}

        {!loading && stateCard.length > 0 && <Grid container spacing={3} sx={{ mb: 4 }}>
          {stateCard.map((stat, index)=>{
            return( <Grid size={{ xs: 12, md: 4 }} key={index}>
                          <StatCard {...stat} />
                    </Grid>)
          })}
        </Grid>}

        {!loading && monthlyData.length > 0 && <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Monthly Trends
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalComplaints"
                  stroke="#7c4dff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Total Complaints"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#4caf50"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>}

        {!loading && categoryData.length > 0 && <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Complaints by Category
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, get_range_of_values()[6] + 10]}
                  ticks={get_range_of_values()}
                />
                <Tooltip />
                <Bar
                  dataKey="complaints"
                  fill="#7c4dff"
                  name="Number of Complaints"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>}

        <Grid container spacing={3} sx={{ paddingBottom: '30px' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              title="Average Resolution Time"
              value="2.5 days"
              color="#2196f3"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              title="Resolution Rate"
              value="78%"
              color="#4caf50"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              title="User Satisfaction"
              value="4.2/5"
              color="#2196f3"
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default AdminDashboard;
