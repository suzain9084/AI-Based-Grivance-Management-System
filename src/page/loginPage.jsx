import React, { useState, useContext, useCallback } from 'react';
import '../css/loginPage.css';
import { useForm } from 'react-hook-form';
import { userContext } from '../context/usercontext';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';


export default function AuthPanel() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [isAdmin, setisAdmin] = useState(false)
  const { User, setUser } = useContext(userContext)
  const navigate = useNavigate()

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

  const onSignUpSubmit = useCallback(async (data) => {
    try {
      console.log('SignUp Data:', data);
      const response = await fetch(apiUrl("/api/users/signup"), {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.status === 400) {
        alert("Student ID or Email already exists");
      } else if (response.status === 201) {
        alert("Sign up successful");
        setUser(resData);
        navigate("/");
      } else {
        alert("Internal Server Error, Try again later.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }, [User]);


  const onSignInSubmit = useCallback(async (data) => {
    console.log(data)
    try {
      let response
      if (data.isAdmin) {
        response = await fetch(apiUrl("/api/admin/login"), {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch(apiUrl("/api/users/login"), {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
        });
      }

      const resData = await response.json();

      if (response.status === 200) {
        setUser(resData);
        alert("Login successful");
        navigate("/");
      } else if (response.status === 401) {
        alert("Invalid Student ID or Password");
      } else {
        alert("Internal Server Error");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }, [User]);


  return (
    <div className='boby'>
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form className='form' onSubmit={handleSubmitSignUp(onSignUpSubmit)}>
            <h1 className='h1'>Create Account</h1>
            <span className='span'>or use your email for registration</span>

            <input
              type="text"
              className={`input ${signUpErrors.full_name ? 'input-error' : ''}`}
              placeholder="Full Name"
              {...registerSignUp('full_name', { required: 'Full Name is required' })}
            />
            {signUpErrors.full_name && <p className="error-message">{signUpErrors.full_name.message}</p>}

            <input
              type="email"
              className={`input ${signUpErrors.email ? 'input-error' : ''}`}
              placeholder="Email"
              {...registerSignUp('email', { required: 'Email is required' })}
            />
            {signUpErrors.email && <p className="error-message">{signUpErrors.email.message}</p>}

            <input
              type="text"
              className={`input ${signUpErrors.phone ? 'input-error' : ''}`}
              placeholder="Phone"
              {...registerSignUp('phone', { required: 'Phone is required' })}
            />
            {signUpErrors.phone && <p className="error-message">{signUpErrors.phone.message}</p>}

            <input
              type="text"
              className={`input ${signUpErrors.department ? 'input-error' : ''}`}
              placeholder="Department"
              {...registerSignUp('department', { required: 'Department is required' })}
            />
            {signUpErrors.department && <p className="error-message">{signUpErrors.department.message}</p>}

            <input
              type="text"
              className={`input ${signUpErrors.year ? 'input-error' : ''}`}
              placeholder="Year"
              {...registerSignUp('year', { required: 'Year is required' })}
            />
            {signUpErrors.year && <p className="error-message">{signUpErrors.year.message}</p>}

            <input
              type="text"
              className={`input ${signUpErrors.student_id ? 'input-error' : ''}`}
              placeholder="Student ID"
              {...registerSignUp('student_id', { required: 'Student ID is required' })}
            />
            {signUpErrors.student_id && <p className="error-message">{signUpErrors.student_id.message}</p>}

            <input
              type="password"
              className={`input ${signUpErrors.password ? 'input-error' : ''}`}
              placeholder="Password"
              {...registerSignUp('password', { required: 'Password is required' })}
            />
            {signUpErrors.password && <p className="error-message">{signUpErrors.password.message}</p>}

            <button className='button' type="submit" disabled={isSignUpSubmitting}>
              {isSignUpSubmitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form className='form' onSubmit={handleSubmitSignIn(onSignInSubmit)}>
            <h1 className='h1'>Sign in</h1>
            <span className='span'>or use your account</span>

            <div>
              <input type="checkbox" name="vehicle1" {...registerSignIn('isAdmin')} onChange={()=>setisAdmin(!isAdmin)} value={isAdmin} />
              <label for="vehicle1">Login as Admin</label>
            </div>

            <input
              type="text"
              className={`input ${signInErrors.student_id ? 'input-error' : ''}`}
              placeholder={isAdmin ? "Admin ID" : "Student ID"}
              {...registerSignIn(isAdmin ? "admin_id" : "student_id", { required: isAdmin ? 'Admin ID is required' : 'Student ID is required' })}
            />
            {signInErrors.student_id && <p className="error-message">{signInErrors.student_id.message}</p>}

            <input
              type="password"
              className={`input ${signInErrors.password ? 'input-error' : ''}`}
              placeholder="Password"
              {...registerSignIn('password', { required: 'Password is required' })}
            />
            {signInErrors.password && <p className="error-message">{signInErrors.password.message}</p>}

            <button className='button' type="submit" disabled={isSignInSubmitting}>
              {isSignInSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className='h1'>Welcome Back!</h1>
              <p className='p'>To keep connected with us please login with your personal info</p>
              <button className="button ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className='h1'>Hello, Friend!</h1>
              <p className='p'>Enter your details and start your journey with us</p>
              <button className="button ghost" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
