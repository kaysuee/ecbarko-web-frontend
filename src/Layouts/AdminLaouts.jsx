import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/admin/Sidebar'
import Topbar from '../components/admin/Topbar'
import '../styles/admin-layout.css'
import { toast } from 'react-hot-toast'

export default function AdminLayouts() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.role !== "admin") {
      navigate('/login')
      toast.error('Access denied. Admin access required.')
    }
  }, [user, navigate])

  return (
    <div className='admin-layout'>
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
