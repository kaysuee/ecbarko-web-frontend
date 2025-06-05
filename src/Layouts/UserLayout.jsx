import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/ticketClerk/Sidebar'
import Topbar from '../components/ticketClerk/Topbar'
import '../styles/ticketclerk-layout.css';
import { toast } from 'react-hot-toast';


export default function UserLayout() {
  const user = useSelector((state) => state.Auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.clerk) {
      navigate('/login');
      toast.error('Access denied. Ticket clerk access required.');
    }
  }, [user, navigate])

  return (
    <div className='ticketclerk-layout'>
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
