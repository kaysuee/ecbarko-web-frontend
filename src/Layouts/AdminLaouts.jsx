import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar, { SidebarProvider, useSidebar } from '../components/admin/Sidebar'
import Topbar from '../components/admin/Topbar'
import '../styles/admin-layout.css'

function AdminContent() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className='admin-layout'>
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

export default function AdminLayouts() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <SidebarProvider>
      <AdminContent />
    </SidebarProvider>
  )
}
