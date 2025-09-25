import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { IoArrowBack } from "react-icons/io5";
import logo from '../../src/assets/imgs/logo-white.png';
import '../styles/ResetPassword.css';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { type, token } = useParams(); // get type (user, clerk, or admin) and token from URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };
  
  // Get the appropriate title and description based on account type
  const getAccountTypeInfo = () => {
    switch(type) {
      case 'admin':
        return {
          title: 'Admin Account Setup',
          description: 'Please set your password to activate your admin account'
        };
      case 'clerk':
        return {
          title: 'Ticket Clerk Account Setup',
          description: 'Please set your password to activate your ticket clerk account'
        };
      case 'user':
        return {
          title: 'User Account Setup',
          description: 'Please set your password to activate your account'
        };
      default:
        return {
          title: 'Account Setup',
          description: 'Please set your password to activate your account'
        };
    }
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
      // decide endpoint based on type in URL
      let endpoint = '';
      if (type === 'user') {
        endpoint = '/api/users/set-password';
      } else if (type === 'clerk') {
        endpoint = '/api/ticketclerks/set-password';
      } else if (type === 'admin') {
        endpoint = '/api/sa-admins/set-password';
      } else {
        toast.error("Invalid account type");
        setIsLoading(false);
        return;
      }

      const request = await post(endpoint, { token, password: newPassword });
      const response = request.data;

      if (request.status === 200) {
        const accountType = type === 'admin' ? 'admin' : type === 'clerk' ? 'ticket clerk' : 'user';
        toast.success(`Password saved successfully. Your ${accountType} account is now active. You can now log in.`);
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to save password. Please try again.');
      }
    } catch (error) {
      console.error('Set password error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400: 
            toast.error(error.response.data?.error || 'Invalid or expired token. Please request a new invitation.');
            break;
          case 401: 
            toast.error('Invalid email or password.'); 
            break;
          case 403: 
            toast.error('Access denied.'); 
            break;
          case 404: 
            toast.error('Account not found.'); 
            break;
          default: 
            toast.error(error.response.data?.message || error.response.data?.error || 'Setup failed.');
        }
      } else if (error.request) {
        toast.error('Unable to connect to server.');
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const accountInfo = getAccountTypeInfo();

  return (
    <div className='reset-container'>
      <div className='reset-login-container'>
        <h1>Welcome!</h1>
        <h2>{accountInfo.title}</h2>
        <p>{accountInfo.description}</p>
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
              <i onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)} className="reset-toggle-password">
                {isNewPasswordVisible ? <i className="fas fa-eye"></i> : <i className="fas fa-eye-slash"></i>}
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
              <i onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="reset-toggle-password">
                {isConfirmPasswordVisible ? <i className="fas fa-eye"></i> : <i className="fas fa-eye-slash"></i>}
              </i>
            </div>
          </div>

          <div className="password-requirements">
            <small>
              Password must contain:
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (@$!%*?#&)</li>
              </ul>
            </small>
          </div>

          {error && <p className="reset-error">{error}</p>}

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Activating Account...' : 'Activate Account'}
          </button>
        </form>
        
        <div className="back-to-login">
          <Link to="/">
            <IoArrowBack /> Back to Login
          </Link>
        </div>
      </div>
      <div className='reset-logo'>
        <img src={logo} alt="logo" />
      </div>
    </div>
  );
}