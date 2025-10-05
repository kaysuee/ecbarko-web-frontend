import "../syles/sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";  // Add useNavigate here
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

  const isActive = (path) => location.pathname.startsWith(path);

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
          <div className="profile-placeholder">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        {!isCollapsed && (
          <>
            <h1>{user?.name || "Guest User"}</h1>
            <p>{user?.role || "Admin"}</p>
          </>
        )}
      </div>

      <ul className="side-menu top">
        <li className={location.pathname === "/admin" ? "active" : ""}>
          <Link to="/admin">
            <i className="bx bxs-dashboard"></i>
            {!isCollapsed && <span className="text">Dashboard</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminUsers") ? "active" : ""}>
          <Link to="/admin/adminUsers">
            <i className="bx bxs-user"></i>
            {!isCollapsed && <span className="text">Users</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminEcBarkoCard") ? "active" : ""}>
          <Link to="/admin/adminEcBarkoCard">
            <i className="bx bxs-card"></i>
            {!isCollapsed && <span className="text">Ecbarko Cards</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminVehicle") ? "active" : ""}>
          <Link to="/admin/adminVehicle">
            <i className="bx bxs-car"></i>
            {!isCollapsed && <span className="text">Vehicles</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminBookings") ? "active" : ""}>
          <Link to="/admin/adminBookings">
            <i className="bx bxs-book"></i>
            {!isCollapsed && <span className="text">Bookings</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminSchedule") ? "active" : ""}>
          <Link to="/admin/adminSchedule">
            <i className="bx bxs-calendar"></i>
            {!isCollapsed && <span className="text">Schedules</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminTapHistory") ? "active" : ""}>
          <Link to="/admin/adminTapHistory">
            <i className="bx bx-history"></i>
            {!isCollapsed && <span className="text">Tap History</span>}
          </Link>
        </li>
        <li className={isActive("/admin/adminTicketClerk") ? "active" : ""}>
          <Link to="/admin/adminTicketClerk">
            <i className="bx bxs-group"></i>
            {!isCollapsed && <span className="text">Ticket Clerks</span>}
          </Link>
        </li>
      </ul>

      <ul className="side-menu">
        <li className={isActive("/admin/adminSettings") ? "active" : ""}>
          <Link to="/admin/adminSettings">
            <i className="bx bxs-cog"></i>
            {!isCollapsed && <span className="text">Settings</span>}
          </Link>
        </li>
        <li className="logout-item">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bx bxs-log-out-circle"></i>
            {!isCollapsed && <span className="text">Logout</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
}

