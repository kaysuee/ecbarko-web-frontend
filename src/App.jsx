import React, { useEffect } from 'react'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/adminDashboard'
import  { Toaster, toast } from 'react-hot-toast';
import SuperAdminLayout from './Layouts/SuperAdmin'
import AdminLaouts from './Layouts/AdminLaouts'
import UserLayout from './Layouts/UserLayout'
import { useDispatch,useSelector } from 'react-redux'
import { updateUser, Logout } from './redux/AuthSlice'
import ProtectedRoute from './components/ProtectedRoute'
import faviconLogo from './assets/imgs/logoblue.png';



import Dashboard from './pages/ticketClerks/dashboard'
import EntryVerificationApp from './pages/ticketClerks/entryVerification'
import History from './pages/ticketClerks/tapHistory'
import TCSettings from './pages/ticketClerks/TCSettings'
import TCNotif from './pages/ticketClerks/TCNotif'
import TcTopUp from './pages/ticketClerks/TcTopUp'
import TcBooking from './pages/ticketClerks/booking'
import TcVehicle from './pages/ticketClerks/vehicles'
import TcCards from './pages/ticketClerks/ecbarko-cards'

import AdminUsers from '../src/pages/admin/adminUsers'
import AdminEcBarkoCard from '../src/pages/admin/adminEcBarkoCard'
import AdminVehicles from '../src/pages/admin/adminVehicles'
import AdminSchedule from '../src/pages/admin/adminSchedule'
import AdminTC from '../src/pages/admin/adminTicketClerk'
import AdminSettings from '../src/pages/admin/adminSettings'
import AdminNotif from './pages/admin/adminNotif'
import AdminBookings from './pages/admin/adminBookings'
import AdminTapHistory from './pages/admin/adminTapHistory'

import SuperAdminDashboard from './pages/superAdmin/saDashboard'
import SuperAdminUsers from './pages/superAdmin/saUsers'
import SuperAdminEcBarkoCard from './pages/superAdmin/saEcBarkoCard'
import SuperAdminVehicles from './pages/superAdmin/saVehicles'
import SuperAdminBookings from './pages/superAdmin/saBookings'
import SuperAdminShedule from './pages/superAdmin/saSchedule'
import SuperAdminTapHistory from './pages/superAdmin/saTapHistory'
import SuperAdminTicketClerk from './pages/superAdmin/saTicketClerk'
import SuperAdminAdmins from './pages/superAdmin/saAdmins'
import AuditTrails from './pages/superAdmin/saAuditTrails';

import SaFare from './pages/superAdmin/saFare';
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
import SetPassword from './pages/SetPassword'


  export default function App() {
    const { user, loading } = useSelector((state) => state.Auth)
    const dispatch = useDispatch()

    useEffect(() => {
      document.title = 'EcBarko'
      
      const favicon = document.querySelector("link[rel='icon']") || 
                  document.createElement("link");

      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = faviconLogo;

      document.head.appendChild(favicon);
      
      const token = localStorage.getItem('token')
      if (token && !user) {
        dispatch(updateUser())
      }

      // Listen for account deactivation events
      const handleAccountDeactivated = (event) => {
        toast.error(event.detail.message || 'Your account has been deactivated');
        // Clear user from Redux store
        dispatch(Logout());
      };

      window.addEventListener('accountDeactivated', handleAccountDeactivated);

      // Cleanup
      return () => {
        window.removeEventListener('accountDeactivated', handleAccountDeactivated);
      };
    }, [dispatch])

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      )
    }

  return (
    <>
          <BrowserRouter>
          <Toaster/>
            <Routes>

              
              <Route path='/ticket-clerk' element={
                <ProtectedRoute allowedRoles={['clerk', 'ticket clerk']}>
                  <UserLayout/>
                </ProtectedRoute>
              }>
              <Route index element={<Dashboard/>}/>
              <Route path='entryVer' element={<EntryVerificationApp/>}/>
              <Route path='history' element={<History/>}/>
              <Route path='topUp' element={<TcTopUp/>}/>
              <Route path='settings' element={<TCSettings/>}/>
              <Route path='tcNotif' element={<TCNotif/>}/>
              <Route path='tcBooking' element={<TcBooking/>}/>
              <Route path='tcVehicles' element={<TcVehicle/>}/>
              <Route path='tcCards' element={<TcCards/>}/>
  

              </Route>
              <Route path='/admin' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLaouts/>
                </ProtectedRoute>
              }>
              <Route index element={<AdminDashboard/>}/>
              <Route path='adminUsers' element={<AdminUsers/>}/>
              <Route path='adminEcBarkoCard' element={<AdminEcBarkoCard/>}/>
              <Route path='adminVehicle' element={<AdminVehicles/>}/>
              <Route path='adminBookings' element={<AdminBookings/>}/>
              <Route path='adminSchedule' element={<AdminSchedule/>}/>
              <Route path='adminTapHistory' element={<AdminTapHistory/>}/>
              <Route path='adminTicketClerk' element={<AdminTC/>}/>
              <Route path='adminSettings' element={<AdminSettings/>}/>
              <Route path='adminNotif' element={<AdminNotif/>}/>

              </Route>

              <Route path='/super-admin' element={
                <ProtectedRoute allowedRoles={['super admin']}>
                  <SuperAdminLayout/>
                </ProtectedRoute>
              }>
              <Route index element={<SuperAdminDashboard/>}/>
              <Route path='saUsers' element={<SuperAdminUsers/>}/>
              <Route path='saEcBarkoCard' element={<SuperAdminEcBarkoCard/>}/>
              <Route path='saVehicle' element={<SuperAdminVehicles/>}/>
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

              <Route path='saFare' element={<SaFare/>}/>

              </Route>

              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/EcBarkoCardFAQs" element={<EcBarkoCardFAQs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:email" element={<ResetPassword />} />
              <Route path="/set-password/:type/:token" element={<SetPassword />} />

            </Routes>
          </BrowserRouter>

    </>
  )
}