import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/superAdmin/Sidebar'
import Topbar from '../components/superAdmin/Topbar'
import '../styles/superAdmin-layout.css'

export default function SuperAdminLayout() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "super admin") {
      navigate('/login')
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
