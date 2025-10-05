import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar, { SidebarProvider, useSidebar } from '../components/superAdmin/Sidebar'
import Topbar from '../components/superAdmin/Topbar'
import '../styles/superAdmin-layout.css'

function SuperAdminContent() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className='superAdmin-layout'>
      <Sidebar />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar />
        <div className='outlet-content'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLayout() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "super admin") {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <SidebarProvider>
      <SuperAdminContent />
    </SidebarProvider>
  )
}
