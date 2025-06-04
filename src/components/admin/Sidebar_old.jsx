import "../syles/sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";  // Add useNavigate here
import logo from '../../assets/imgs/logo.png';
import profile from '../../assets/imgs/profile.png';
import { Logout } from '../../redux/AuthSlice';
import { useSelector, useDispatch } from 'react-redux';
import { post } from '../../services/ApiEndpoint';

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();  
  const user = useSelector((state) => state.Auth.user);

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
    <aside className="sidebar">
      <div className="brand">
        <img src={logo} alt="EcBarko Logo" />
        <span className="text">EcBarko</span>
      </div>

      <div className="profile">
        <img src={profile} alt="Profile" />
        <h1>{user?.name || "Nisha Kumari"}</h1>
        <p>Admin</p>
      </div>

      <ul className="side-menu top">
        <li className={location.pathname === "/admin" ? "active" : ""}>
          <Link to="/admin">
            <i className="bx bxs-dashboard"></i>
            <span className="text">Dashboard</span>
          </Link>
        </li>
        <li className={isActive("/admin/adminUsers") ? "active" : ""}>
          <Link to="/admin/adminUsers">
            <i className="bx bxs-user"></i>
            <span className="text">Users</span>
          </Link>
        </li>
        <li className={isActive("/admin/adminEcBarkoCard") ? "active" : ""}>
          <Link to="/admin/adminEcBarkoCard">
            <i className="bx bxs-card"></i>
            <span className="text">Ecbarko Cards</span>
          </Link>
        </li>
        <li className={isActive("/admin/adminVehicle") ? "active" : ""}>
          <Link to="/admin/adminVehicle">
            <i className="bx bxs-car"></i>
            <span className="text">Vehicles</span>
          </Link>
        </li>
        <li className={isActive("/admin/adminSchedule") ? "active" : ""}>
          <Link to="/admin/adminSchedule">
            <i className="bx bxs-calendar"></i>
            <span className="text">Schedules</span>
          </Link>
        </li>
        <li className={isActive("/admin/adminTicketClerk") ? "active" : ""}>
          <Link to="/admin/adminTicketClerk">
            <i className="bx bxs-group"></i>
            <span className="text">Ticket Clerks</span>
          </Link>
        </li>
      </ul>

      <ul className="side-menu">
        <li className={isActive("/admin/adminSettings") ? "active" : ""}>
          <Link to="/admin/adminSettings">
            <i className="bx bxs-cog"></i>
            <span className="text">Settings</span>
          </Link>
        </li>
        <li className="logout-item">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bx bxs-log-out-circle"></i>
            <span className="text">Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}

