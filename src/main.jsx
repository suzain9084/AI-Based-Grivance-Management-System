import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.jsx'
import theme from './theme.js'
import { UserContextProvider } from './context/usercontext.jsx'
import { ToastProvider } from './context/toastcontext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContextProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </UserContextProvider>
    </ThemeProvider>
  </StrictMode>,
)
