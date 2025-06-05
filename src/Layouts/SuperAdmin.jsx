import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/superAdmin/Sidebar'
import Topbar from '../components/superAdmin/Topbar'
import '../styles/superAdmin-layout.css'
import { toast } from 'react-hot-toast'

export default function SuperAdminLayout() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== "super admin") {
      navigate('/login');
      toast.error('Access denied. Super admin access required.');
    }
  }, [user, navigate])

  return (
    <div className='superAdmin-layout'>
      <Sidebar />
      <div className='main-content'>
        <Topbar />
        <div className='outlet-content'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
