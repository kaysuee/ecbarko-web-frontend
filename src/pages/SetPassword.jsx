import React, { useState } from 'react'
import { Link, useNavigate,useParams } from 'react-router-dom'
import { post } from '../services/ApiEndpoint'
import { toast } from 'react-hot-toast';
import { IoArrowBack } from "react-icons/io5";
import logo from '../../src/assets/imgs/logo-white.png'
import '../styles/ResetPassword.css'

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate()
  
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
        return setError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
      }
    
      if (newPassword !== confirmPassword) {
        return setError("Passwords do not match.");
      }
    
      setError("");
    setIsLoading(true);
    try {
        const request = await post('/api/users/set-password', { 
            token, 
            password: newPassword 
        });

      
      const response = request.data 

     
      console.log(response)
        if (request.status === 200) {
            toast.success('Password saved successfully. You can now log in to the EcBarko mobile app.');
            navigate('/');
        } else {
            toast.error(response.message || 'Failed to save password. Please try again.');
        }
      
    } catch (error) {
      console.error('Login error:', error)
      
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
    <div className='reset-container'>
      <div className='reset-login-container'>
        <h1>Welcome!</h1>
        <p>Please set your password to activate your account</p>
        <form onSubmit={handleSubmit}>
          <div className='reset-input-group'>
            <label htmlFor="newPassword">Enter Password</label>
            <div className="reset-password-container">
              <input 
                type={isNewPasswordVisible ? "text" : "password"} 
                id="newPassword" 
                placeholder="Enter password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <i 
                onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)} 
                className="reset-toggle-password"
              >
                {isNewPasswordVisible ? (
                  <i className="fas fa-eye"></i> 
                ) : (
                  <i className="fas fa-eye-slash"></i> 
                )}
              </i>
            </div>
          </div>

          <div className='reset-input-group'>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="reset-password-container">
              <input 
                type={isConfirmPasswordVisible ? "text" : "password"} 
                id="confirmPassword" 
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <i 
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} 
                className="reset-toggle-password"
              >
                {isConfirmPasswordVisible ? (
                  <i className="fas fa-eye"></i> 
                ) : (
                  <i className="fas fa-eye-slash"></i> 
                )}
              </i>
            </div>
          </div>

          {error && <p className="reset-error">{error}</p>}

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
      <div className='reset-logo'>
        <img src={logo} alt="logo" />
      </div>
    </div>
    </>
  )
}