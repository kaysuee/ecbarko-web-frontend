import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post } from '../services/ApiEndpoint'
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux'
import { IoArrowBack } from "react-icons/io5";
import logo from '../../src/assets/imgs/logo-white.png'
import '../styles/Login.css'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(email)
    try {
      const request = await post('http://localhost:4000/api/auth/forgotpassword', { email })
      const response = request.data 

     
      console.log(response)
      if (response.success) {
        toast.success('Password reset link sent to your email.')
        navigate('/login')
      } else {
        toast.error(response.message || 'Failed to send reset link. Please try again.')
      }

    } catch (error) {
      console.error('Login error:', error)
      
      // Enhanced error handling
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error('Invalid email or password. Please try again.')
            break
          case 403:
            toast.error('Access denied. You are not authorized to access this system.')
            break
          case 404:
            toast.error('Account not found.')
            break
          default:
            toast.error(error.response.data?.message || 'Login failed. Please try again.')
        }
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your connection.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <>
    <div className='container'>
      <div className='login-container'>
        <div className="back-wrapper">
          <Link to="/login" className="back-link">
            <IoArrowBack size={28} style={{ marginRight: '8px', color: '#013986' }} />
          </Link>
        </div>
        <h1>Forgot Password</h1>
        <p>Enter your email to reset your password</p>
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
          <button type='submit'>Send Reset Link</button>
        </form>
      </div>
      <div className='logo'>
        <img src={logo} alt="logo" />
      </div>
    </div>
    </>
  )
}



