import "../syles/sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";  
import logo from '../../assets/imgs/logo.png';
import profile from '../../assets/imgs/profile.png';
import { Logout } from '../../redux/AuthSlice';
import { useSelector, useDispatch } from 'react-redux';
import { post } from '../../services/ApiEndpoint';
import { useState, createContext, useContext } from 'react';

// Create and export context for sidebar state
export const SidebarContext = createContext();

// Hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// SidebarProvider component
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();  
  const user = useSelector((state) => state.Auth.user);
  const { isCollapsed } = useSidebar();

  // Fixed isActive function to use exact path matching
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      const request = await post('/api/auth/logout');
      const response = request.data;
      if (request.status === 200) {
        dispatch(Logout());
        navigate('/login');  
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'hide' : ''}`}>
        <div className="brand">
          <img src={logo} alt="EcBarko Logo" />
          {!isCollapsed && <span className="text">EcBarko</span>}
        </div>

        <div className="profile">
          {user?.profileImage ? (
            <img 
              src={
                user.profileImage.startsWith('http') 
                  ? user.profileImage 
                  : `https://ecbarko-back.onrender.com${user.profileImage}`
              } 
              alt="Profile" 
              className="profile-img" 
            />
          ) : (
            <div className="profile-placeholder">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
          )}
          {!isCollapsed && (
            <>
              <h1>{user?.name || "Guest User"}</h1>
              <p>{user?.role || "Super Admin"}</p>
            </>
          )}
        </div>

        <ul className="side-menu top">
          <li className={location.pathname === "/super-admin" ? "active" : ""}>
            <Link to="/super-admin" title={isCollapsed ? "Dashboard" : ""}>
              <i className="bx bxs-dashboard"></i>
              {!isCollapsed && <span className="text">Dashboard</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saUsers") ? "active" : ""}>
            <Link to="/super-admin/saUsers" title={isCollapsed ? "Users" : ""}>
              <i className="bx bxs-user"></i>
              {!isCollapsed && <span className="text">Users</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saEcBarkoCard") ? "active" : ""}>
            <Link to="/super-admin/saEcBarkoCard" title={isCollapsed ? "Ecbarko Cards" : ""}>
              <i className="bx bxs-card"></i>
              {!isCollapsed && <span className="text">Ecbarko Cards</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saVehicle") ? "active" : ""}>
            <Link to="/super-admin/saVehicle" title={isCollapsed ? "Vehicles" : ""}>
              <i className="bx bxs-car"></i>
              {!isCollapsed && <span className="text">Vehicles</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saFare") ? "active" : ""}>
            <Link to="/super-admin/saFare" title={isCollapsed ? "Rates" : ""}>
              <i className="bx bxs-coin"></i>
              {!isCollapsed && <span className="text">Rates</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saBookings") ? "active" : ""}>
            <Link to="/super-admin/saBookings" title={isCollapsed ? "Bookings" : ""}>
              <i className="bx bxs-book"></i>
              {!isCollapsed && <span className="text">Bookings</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saSchedule") ? "active" : ""}>
            <Link to="/super-admin/saSchedule" title={isCollapsed ? "Schedules" : ""}>
              <i className="bx bxs-calendar"></i>
              {!isCollapsed && <span className="text">Schedules</span>}
            </Link>
          </li>
           <li className={isActive("/super-admin/saTapHistory") ? "active" : ""}>
            <Link to="/super-admin/saTapHistory" title={isCollapsed ? "Tap History" : ""}>
              <i className="bx bx-history"></i>
              {!isCollapsed && <span className="text">Tap History</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saTicketClerk") ? "active" : ""}>
            <Link to="/super-admin/saTicketClerk" title={isCollapsed ? "Ticket Clerks" : ""}>
              <i className="bx bxs-group"></i>
              {!isCollapsed && <span className="text">Ticket Clerks</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saAdmins") ? "active" : ""}>
            <Link to="/super-admin/saAdmins" title={isCollapsed ? "Admins" : ""}>
              <i className="bx bxs-group"></i>
              {!isCollapsed && <span className="text">Admins</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saAuditTrails") ? "active" : ""}>
            <Link to="/super-admin/saAuditTrails" title={isCollapsed ? "Audit Trails" : ""}>
              <i className="bx bxs-report"></i>
              {!isCollapsed && <span className="text">Audit Trails</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/saAnnouncement") ? "active" : ""}>
            <Link to="/super-admin/saAnnouncement" title={isCollapsed ? "Announcement" : ""}>
              <i className="bx bxs-megaphone"></i>
              {!isCollapsed && <span className="text">Announcement</span>}
            </Link>
          </li>
        </ul>

        <ul className="side-menu">
          {!isCollapsed && <p>Edit Webpage</p>}
          <li className={isActive("/super-admin/editHome") ? "active" : ""}>
            <Link to="/super-admin/editHome" title={isCollapsed ? "Edit Home" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">Home</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/editEBC") ? "active" : ""}>
            <Link to="/super-admin/editEBC" title={isCollapsed ? "Edit About EcBarko Card" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">About EcBarko Card</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/editAbout") ? "active" : ""}>
            <Link to="/super-admin/editAbout" title={isCollapsed ? "Edit About" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">About</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/editContact") ? "active" : ""}>
            <Link to="/super-admin/editContact" title={isCollapsed ? "Edit Contact Us" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">Contact Us</span>}
            </Link>
          </li>
        </ul>

        <ul className="side-menu">
          {!isCollapsed && <p>Edit App</p>}
          <li className={isActive("/super-admin/editAboutApp") ? "active" : ""}>
            <Link to="/super-admin/editAboutApp" title={isCollapsed ? "Edit About App" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">About App</span>}
            </Link>
          </li>
          <li className={isActive("/super-admin/editFaqs") ? "active" : ""}>
            <Link to="/super-admin/editFaqs" title={isCollapsed ? "Edit FAQs" : ""}>
              <i className="bx bxs-pencil"></i>
              {!isCollapsed && <span className="text">FAQs</span>}
            </Link>
          </li>
        </ul>

        <ul className="side-menu">
          <li className={isActive("/super-admin/saSettings") ? "active" : ""}>
            <Link to="/super-admin/saSettings" title={isCollapsed ? "Settings" : ""}>
              <i className="bx bxs-cog"></i>
              {!isCollapsed && <span className="text">Settings</span>}
            </Link>
          </li>
          <li className="logout-item">
            <button className="logout-btn" onClick={handleLogout} title={isCollapsed ? "Logout" : ""}>
              <i className="bx bxs-log-out-circle"></i>
              {!isCollapsed && <span className="text">Logout</span>}
            </button>
          </li>
        </ul>
      </aside>
  );
}