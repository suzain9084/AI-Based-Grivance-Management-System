import React, { useContext } from 'react';
import "../css/navbar.css";
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Report';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../context/usercontext';
import { useToast } from '../context/toastcontext';
import { Avatar } from "@mui/material"

const Navbar = () => {
  const navigate = useNavigate()
  const { User, logout, isLoggedIn } = useContext(userContext)
  const { showToast } = useToast()

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="brand">
        {isLoggedIn ? (
          <>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#111827',
                fontWeight: 700,
              }}>
              {(User.full_name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <div className="brand-text">
              <h3>{User.full_name}</h3>
              <p>{User.isAdmin ? "Administrator" : User.department}</p>
            </div>
          </>
        ) : (
          <div className="button-cont-nav">
            <button type="button" className="login-btn" onClick={() => navigate("/login")}>Login</button>
            <button type="button" className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        )}
      </div>

      <ul className="nav-links">
        <NavLink to={"/dashboard"} className={({ isActive }) => (isActive ? 'active' : '')}>
          <li><DashboardIcon sx={{ height: "70%", width: 'auto' }} /><span>Dashboard</span></li>
        </NavLink>
        <NavLink to={"/"} end className={({ isActive }) => (isActive ? 'active' : '')}>
          <li><ReportIcon sx={{ height: "70%", width: 'auto' }} /><span>Complaints</span></li>
        </NavLink>
        {isLoggedIn && (
          <>
            <NavLink to={"/profile"} className={({ isActive }) => (isActive ? 'active' : '')}>
              <li><PersonIcon sx={{ height: "70%", width: 'auto' }} /><span>Profile</span></li>
            </NavLink>
            <NavLink to={"/settings"} className={({ isActive }) => (isActive ? 'active' : '')}>
              <li><SettingsIcon sx={{ height: "70%", width: 'auto' }} /><span>Settings</span></li>
            </NavLink>
          </>
        )}
      </ul>

      {isLoggedIn && (
        <button type="button" className="logout" onClick={handleLogout}>
          <LogoutIcon /><span>Logout</span>
        </button>
      )}
    </div>
  );
};

export default Navbar;
