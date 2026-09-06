import './App.css'
import UserHomePage from './page/userHomePage'
import AddgrievancePage from './page/addgrievancePage'
import Profilepage from './page/profilepage'
import Userdashboard from './page/userdashboard.jsx'
import SettingsPage from './page/settingsPage.jsx'
import LoginPage from './page/loginPage'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from 'react-router'
import Adminprofile from './page/admin_profile_setting_page.jsx'
import AdminComplainPage from './page/admin_complain_page.jsx'
import AdminDashboardepage from './page/admin_dashboard_page.jsx'
import { userContext } from './context/usercontext.jsx'
import { useContext } from 'react'

function RolePage({ admin, user }) {
  const { User } = useContext(userContext)
  return User.isAdmin ? admin : user
}

const routes = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <RolePage admin={<AdminComplainPage />} user={<UserHomePage />} />
  },
  {
    path: "/dashboard",
    element: <RolePage admin={<AdminDashboardepage />} user={<Userdashboard />} />
  },
  {
    path: "/about",
    element: <div>hellllo</div>
  },
  {
    path: "/profile",
    element: <RolePage admin={<Adminprofile />} user={<Profilepage />} />
  },
  {
    path: "/addGrievance",
    element: <AddgrievancePage />
  },
  {
    path: "/settings",
    element: <SettingsPage />
  },
])

function App() {
  return <RouterProvider router={routes} />
}

export default App
