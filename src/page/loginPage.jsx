import React, { useState, useContext, useCallback, useEffect } from 'react';
import '../css/loginPage.css';
import { useForm } from 'react-hook-form';
import { userContext } from '../context/usercontext';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import { useToast } from '../context/toastcontext';


export default function AuthPanel() {
  const location = useLocation();
  const [isRightPanelActive, setIsRightPanelActive] = useState(location.pathname === '/signup');
  const [isAdmin, setisAdmin] = useState(false);
  const { setUser } = useContext(userContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsRightPanelActive(location.pathname === '/signup');
  }, [location.pathname]);

  const showSignIn = () => {
    setIsRightPanelActive(false);
    navigate('/login', { replace: true });
  };

  const showSignUp = () => {
    setIsRightPanelActive(true);
    navigate('/signup', { replace: true });
  };

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors, isSubmitting: isSignUpSubmitting },
  } = useForm();

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors, isSubmitting: isSignInSubmitting },
  } = useForm();

  const adminRegister = registerSignIn('isAdmin');
  const signInIdError = signInErrors.student_id || signInErrors.admin_id;

  const onSignUpSubmit = useCallback(async (data) => {
    try {
      const response = await fetch(apiUrl("/api/users/signup"), {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.status === 400) {
        showToast("Student ID or Email already exists", "error");
      } else if (response.status === 201) {
        showToast("Sign up successful", "success");
        setUser(resData);
        navigate("/");
      } else {
        showToast("Internal server error. Try again later.", "error");
      }
    } catch (error) {
      showToast(error.message || "Unable to sign up", "error");
    }
  }, [navigate, setUser, showToast]);


  const onSignInSubmit = useCallback(async (data) => {
    try {
      let response
      if (data.isAdmin) {
        response = await fetch(apiUrl("/api/admin/login"), {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_id: data.admin_id || data.student_id,
            password: data.password,
          })
        });
      } else {
        response = await fetch(apiUrl("/api/users/login"), {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: data.student_id || data.admin_id,
            password: data.password,
          })
        });
      }

      const resData = await response.json();

      if (response.status === 200) {
        setUser(resData);
        showToast("Login successful", "success");
        navigate("/");
      } else if (response.status === 401) {
        showToast("Invalid ID or password", "error");
      } else {
        showToast("Internal server error", "error");
      }
    } catch (error) {
      showToast(error.message || "Unable to sign in", "error");
    }
  }, [navigate, setUser, showToast]);


  return (
    <div className='auth-page'>
      <div className="auth-brand">
        <h2>Grievance Hub</h2>
        <p>Submit, track, and resolve campus grievances</p>
      </div>

      <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">

        {/* Sign Up Form */}
        <div className="auth-form-container sign-up-container">
          <form className='auth-form' onSubmit={handleSubmitSignUp(onSignUpSubmit)}>
            <h1 className='auth-title'>Create Account</h1>
            <p className='auth-subtitle'>Enter your student details to register</p>

            <div className="signup-grid">
              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signUpErrors.full_name ? 'input-error' : ''}`}
                  placeholder="Full Name"
                  autoComplete="name"
                  {...registerSignUp('full_name', { required: 'Full Name is required' })}
                />
                {signUpErrors.full_name && <p className="error-message">{signUpErrors.full_name.message}</p>}
              </div>

              <div className="field">
                <input
                  type="email"
                  className={`auth-input ${signUpErrors.email ? 'input-error' : ''}`}
                  placeholder="Email"
                  autoComplete="email"
                  {...registerSignUp('email', { required: 'Email is required' })}
                />
                {signUpErrors.email && <p className="error-message">{signUpErrors.email.message}</p>}
              </div>

              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signUpErrors.phone ? 'input-error' : ''}`}
                  placeholder="Phone"
                  autoComplete="tel"
                  {...registerSignUp('phone', { required: 'Phone is required' })}
                />
                {signUpErrors.phone && <p className="error-message">{signUpErrors.phone.message}</p>}
              </div>

              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signUpErrors.department ? 'input-error' : ''}`}
                  placeholder="Department"
                  {...registerSignUp('department', { required: 'Department is required' })}
                />
                {signUpErrors.department && <p className="error-message">{signUpErrors.department.message}</p>}
              </div>

              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signUpErrors.year ? 'input-error' : ''}`}
                  placeholder="Year"
                  {...registerSignUp('year', { required: 'Year is required' })}
                />
                {signUpErrors.year && <p className="error-message">{signUpErrors.year.message}</p>}
              </div>

              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signUpErrors.student_id ? 'input-error' : ''}`}
                  placeholder="Student ID"
                  {...registerSignUp('student_id', { required: 'Student ID is required' })}
                />
                {signUpErrors.student_id && <p className="error-message">{signUpErrors.student_id.message}</p>}
              </div>

              <div className="field field-full">
                <input
                  type="password"
                  className={`auth-input ${signUpErrors.password ? 'input-error' : ''}`}
                  placeholder="Password"
                  autoComplete="new-password"
                  {...registerSignUp('password', { required: 'Password is required' })}
                />
                {signUpErrors.password && <p className="error-message">{signUpErrors.password.message}</p>}
              </div>
            </div>

            <button className='auth-button' type="submit" disabled={isSignUpSubmitting}>
              {isSignUpSubmitting ? 'Signing up...' : 'Sign Up'}
            </button>

            <p className="mobile-switch">
              Already have an account? <button type="button" onClick={showSignIn}>Sign In</button>
            </p>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container sign-in-container">
          <form className='auth-form' onSubmit={handleSubmitSignIn(onSignInSubmit)}>
            <h1 className='auth-title'>Sign in</h1>
            <p className='auth-subtitle'>Use your student or admin credentials</p>

            <div className="auth-form-fields">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  {...adminRegister}
                  onChange={(e) => {
                    adminRegister.onChange(e);
                    setisAdmin(e.target.checked);
                  }}
                />
                Login as Admin
              </label>

              <div className="field">
                <input
                  type="text"
                  className={`auth-input ${signInIdError ? 'input-error' : ''}`}
                  placeholder={isAdmin ? "Admin ID" : "Student ID"}
                  autoComplete="username"
                  {...registerSignIn(isAdmin ? "admin_id" : "student_id", { required: isAdmin ? 'Admin ID is required' : 'Student ID is required' })}
                />
                {signInIdError && <p className="error-message">{signInIdError.message}</p>}
              </div>

              <div className="field">
                <input
                  type="password"
                  className={`auth-input ${signInErrors.password ? 'input-error' : ''}`}
                  placeholder="Password"
                  autoComplete="current-password"
                  {...registerSignIn('password', { required: 'Password is required' })}
                />
                {signInErrors.password && <p className="error-message">{signInErrors.password.message}</p>}
              </div>
            </div>

            <button className='auth-button' type="submit" disabled={isSignInSubmitting}>
              {isSignInSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="mobile-switch">
              New to Grievance Hub? <button type="button" onClick={showSignUp}>Sign Up</button>
            </p>
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className='auth-title'>Welcome Back!</h1>
              <p>Sign in with your account to continue tracking and managing grievances.</p>
              <button type="button" className="auth-button ghost" onClick={showSignIn}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className='auth-title'>Hello, Friend!</h1>
              <p>Create an account to submit complaints and follow their resolution.</p>
              <button type="button" className="auth-button ghost" onClick={showSignUp}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
