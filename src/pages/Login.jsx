import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post } from '../services/ApiEndpoint'
import { toast, Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux'
import { SetUser } from '../redux/AuthSlice';
import { IoArrowBack } from "react-icons/io5";
import logo from '../../src/assets/imgs/logo-white.png'
import '../styles/Login.css'

export default function Login() {
  const user = useSelector((state) => state.Auth)
  const [isLoading, setIsLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(true);
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const request = await post('/api/auth/login', { email, password })
    const response = request.data 
    console.log("login response:", response)
    
    if (response.success) {
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Check if user data exists
      if (response.user) {
        // Handle different user types
        if (response.clerk) {
          // This is a ticket clerk - check status instead of role
          if (response.user.status === 'active') {
            navigate('/ticket-clerk')
            toast.success(response.message)
            dispatch(SetUser(response.user))
          } else {
            toast.error('Account is not active')
          }
        } else if (response.user.role) {
          if (response.user.role === 'super admin') {
            navigate('/super-admin')
          } else if (response.user.role === 'admin') {
            navigate('/admin')
          }
          toast.success(response.message)
          dispatch(SetUser(response.user))
        } else {
          toast.error('Invalid user type')
        }
      } else {
        toast.error('Invalid user data received')
      }
    } else {
      toast.error(response.message || 'Login failed')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error(error.response.data?.message || 'Invalid email or password')
          break
        case 403:
          toast.error(error.response.data?.message || 'Access denied')
          break
        case 404:
          toast.error('Account not found')
          break
        default:
          toast.error(error.response.data?.message || 'Login failed')
      }
    } else if (error.request) {
      toast.error('Unable to connect to server')
    } else {
      toast.error('Something went wrong')
    }
  } finally {
    setIsLoading(false)
  }
}

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  

  return (
    <>
    <Toaster position="top-center" />
    {showPopup && (
      <div className="login-popup-overlay">
        <div className="login-popup">
          <h2 className="login-popup-title">Notice</h2>
          <p className="login-popup-message">
            Access is restricted to authorized personnel (administrators and ticket clerks) only.
            General users are kindly requested to download and log in through the mobile application.
          </p>
          <button className="login-popup-button" onClick={() => setShowPopup(false)}>Got it</button>
          <span className="login-popup-link">
            <Link to="/">Go back to Homepage</Link>
          </span>
        </div>
      </div>
    )}


    <div className='container'>
      <div className='login-container'>
        <div className="back-wrapper">
          <Link to="/" className="back-link">
            <IoArrowBack size={28} style={{ marginRight: '8px' }} />
          </Link>
        </div>
        <h1>Login</h1>
        <p>Welcome back! Please log in to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor="Email">Email</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className='input-group'>
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input 
                type={isPasswordVisible ? "text" : "password"} 
                name="" 
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)} 
                id="password" 
                required
              />
              <i 
                onClick={() => setIsPasswordVisible(!isPasswordVisible)} 
                className={isPasswordVisible ? "show" : "hide"}>
                {isPasswordVisible ? (
                  <i className="fas fa-eye"></i> 
                ) : (
                  <i className="fas fa-eye-slash"></i> 
                )}
              </i>
            </div>
            <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
            </div>
          </div>
          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <div className='logo'>
        <img src={logo} alt="logo" />
      </div>
    </div>
    </>
  )
}