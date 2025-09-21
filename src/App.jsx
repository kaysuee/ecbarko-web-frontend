import React, { useEffect } from 'react'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/adminDashboard'
import  { Toaster } from 'react-hot-toast';
import SuperAdminLayout from './Layouts/SuperAdmin'
import AdminLaouts from './Layouts/AdminLaouts'
import UserLayout from './Layouts/UserLayout'
import { useDispatch,useSelector } from 'react-redux'
import { updateUser } from './redux/AuthSlice'


import Dashboard from './pages/ticketClerks/dashboard'
import EntryVerificationApp from './pages/ticketClerks/entryVerification'
import History from './pages/ticketClerks/tapHistory'
import TCSettings from './pages/ticketClerks/TCSettings'
import TCNotif from './pages/ticketClerks/TCNotif'
import TcTopUp from './pages/ticketClerks/TcTopUp'

import AdminUsers from '../src/pages/admin/adminUsers'
import AdminEcBarkoCard from '../src/pages/admin/adminEcBarkoCard'
// import AdminVehicles from '../src/pages/admin/adminVehicles'
import AdminSchedule from '../src/pages/admin/adminSchedule'
import AdminTC from '../src/pages/admin/adminTicketClerk'
import AdminSettings from '../src/pages/admin/adminSettings'
import AdminNotif from './pages/admin/adminNotif'
import AdminBookings from './pages/admin/adminBookings'
import AdminTapHistory from './pages/admin/adminTapHistory'

import SaFare from './pages/superAdmin/saFare';
import SuperAdminDashboard from './pages/superAdmin/saDashboard'
import SuperAdminUsers from './pages/superAdmin/saUsers'
import SuperAdminEcBarkoCard from './pages/superAdmin/saEcBarkoCard'
// import SuperAdminVehicles from './pages/superAdmin/saVehicles'
import SuperAdminBookings from './pages/superAdmin/saBookings'
import SuperAdminShedule from './pages/superAdmin/saSchedule'
import SuperAdminTapHistory from './pages/superAdmin/saTapHistory'
import SuperAdminTicketClerk from './pages/superAdmin/saTicketClerk'
import SuperAdminAdmins from './pages/superAdmin/saAdmins'
import AuditTrails from './pages/superAdmin/saAuditTrails';
import SuperAdminSettings from './pages/superAdmin/saSettings'
import EditAbout from './pages/superAdmin/saEditAbout'
import EditEBC from './pages/superAdmin/saEditEBC'
import EditHome from './pages/superAdmin/saEditHome'
import EditContact from './pages/superAdmin/saEditContact'
import EditAboutApp from './pages/superAdmin/saEditAboutApp' 
import EditFaqs from './pages/superAdmin/saEditFaqs'
import AllNotifications from './pages/superAdmin/saAllNotif'
import SuperAdminAnnouncement from './pages/superAdmin/saAnnouncement'

import LandingPage from './pages/guest/LandingPage'
import About from './pages/guest/About'
import Contact from './pages/guest/Contact'
import EcBarkoCardFAQs from './pages/guest/EcBarkoCardFAQs'
import ForgotPassword from './pages/forgotpassword'
import ResetPassword from './pages/resetpassword'


export default function App() {
  const user=useSelector((state)=>state.Auth.user)
const disptch=useDispatch()

  useEffect(()=>{
         
        disptch(updateUser())
  },[user])

  return (
    <>
          <BrowserRouter>
          <Toaster/>
            <Routes>

              
              <Route path='/ticket-clerk' element={<UserLayout/>} >
              <Route index element={<Dashboard/>}/>
              <Route path='entryVer' element={<EntryVerificationApp/>}/>
              <Route path='history' element={<History/>}/>
              <Route path='topUp' element={<TcTopUp/>}/>
              <Route path='settings' element={<TCSettings/>}/>
              <Route path='tcNotif' element={<TCNotif/>}/>
  

              </Route>
              <Route path='/admin' element={<AdminLaouts/>}>
              <Route index element={<AdminDashboard/>}/>
              <Route path='adminUsers' element={<AdminUsers/>}/>
              <Route path='adminEcBarkoCard' element={<AdminEcBarkoCard/>}/>
              {/* <Route path='adminVehicle' element={<AdminVehicles/>}/> */}
              <Route path='adminBookings' element={<AdminBookings/>}/>
              <Route path='adminSchedule' element={<AdminSchedule/>}/>
              <Route path='adminTapHistory' element={<AdminTapHistory/>}/>
              <Route path='adminTicketClerk' element={<AdminTC/>}/>
              <Route path='adminSettings' element={<AdminSettings/>}/>
              <Route path='adminNotif' element={<AdminNotif/>}/>

              </Route>

              <Route path='/super-admin' element={<SuperAdminLayout/>}>
              <Route index element={<SuperAdminDashboard/>}/>
              <Route path='saUsers' element={<SuperAdminUsers/>}/>
              <Route path='saFare' element={<SaFare/>}/>
              <Route path='saEcBarkoCard' element={<SuperAdminEcBarkoCard/>}/>
              {/* <Route path='saVehicle' element={<SuperAdminVehicles/>}/> */}
              <Route path='saBookings' element={<SuperAdminBookings/>}/>
              <Route path='saSchedule' element={<SuperAdminShedule/>}/>
              <Route path='saTapHistory' element={<SuperAdminTapHistory/>}/>
              <Route path='saTicketClerk' element={<SuperAdminTicketClerk/>}/>
              <Route path='saAdmins' element={<SuperAdminAdmins/>}/>
              <Route path='saAuditTrails' element={<AuditTrails/>}/>
              <Route path='saAnnouncement' element={<SuperAdminAnnouncement/>}/>
              <Route path='saSettings' element={<SuperAdminSettings/>}/>
              <Route path='saNotif' element={<AllNotifications/>}/>
              <Route path='editAbout' element={<EditAbout/>}/>
              <Route path='editEBC' element={<EditEBC/>}/>
              <Route path='editHome' element={<EditHome/>}/>
              <Route path='editContact' element={<EditContact/>}/>
              <Route path='editAboutApp' element={<EditAboutApp/>}/> 
              <Route path='editFaqs' element={<EditFaqs/>}/>

              </Route>

              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/EcBarkoCardFAQs" element={<EcBarkoCardFAQs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/resetpassword/:email" element={<ResetPassword />} />

            </Routes>
          </BrowserRouter>

    </>
  )
}