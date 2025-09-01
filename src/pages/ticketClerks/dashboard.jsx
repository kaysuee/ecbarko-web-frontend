import React, { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get } from '../../services/ApiEndpoint'; 
import '../../styles/Dashboard.css';
import { generateDashboardGraphsPDF } from '../../utils/pdfUtils';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";

import tapEntry from '../../assets/imgs/tapEntryLogo.png';
import topUp from '../../assets/imgs/topUpLogo.png';

export default function Dashboard() {
  const user = useSelector((state) => state.Auth.user);
  const dashboardRef = useRef(null);
  const [recentTaps, setRecentTaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTaps = async () => {
      try {
        const response = await get("/api/auth/tapHistory");
        // Get only the 5 most recent entries
        const recent = response.data.slice(0, 5);
        setRecentTaps(recent);
      } catch (error) {
        console.error("Error fetching recent taps:", error);
        toast.error('Failed to load recent taps');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTaps();
  }, []);


  return (
    <main className="dashboard" ref={dashboardRef}>
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Dashboard</h1>
          <ul className="breadcrumb">
            <li><a href="#">Dashboard</a></li>
            <li><i className="bx bx-chevron-right"></i></li>
            <li><a className="active" href="#">Home</a></li>
          </ul>
        </div>
      </div>

      <ul className="box-info">
        <button className="tc-card-button">
          <Link to="/ticket-clerk/entryVer" className="text">
            <img src={tapEntry} alt="" />
            <h1>Tap Entry</h1>
          </Link>
        </button>
        <button className="tc-card-button">
          <Link to="/ticket-clerk/topUp" className="text">
            <img src={topUp} alt="" />
            <h1>Top-Up Card</h1>
          </Link>
        </button>
      </ul>

      <div className="tc-tables">
        <div className="recent-taps">
          <div className="head">
            <h1>Recent Taps</h1>  {/* Add the title here */}
            <div className="recent-view-all">
              <Link to="/ticket-clerk/history" className="view-all-link">
                View All →
              </Link>
            </div>
          </div>
          <div className="recent-tap-table">
            {loading ? (
              <div className="loading">Loading recent taps...</div>
            ) : recentTaps.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Card No</th>
                    <th>Vehicle Type</th>
                    <th>Date &amp; Time</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Route</th>
                  </tr>
                </thead>
                <tbody>
                    {recentTaps.map((entry) => (
                      <tr key={entry._id}>
                      <td>
                        <div className="recent-user-info">
                          <div className="initial-avatar">{entry.name.charAt(0)}</div>
                          <span>{entry.name}</span>
                        </div>
                      </td>
                      <td>{entry.cardNo}</td>
                      <td>{entry.vehicleType}</td>
                      <td>
                        {new Date(
                          entry.clientTimestamp || entry.createdAt
                        ).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`status ${
                            entry.hasActiveBooking ? "active" : "deactivated"
                          }`}
                        >
                          {entry.hasActiveBooking ? "Entry Allowed" : "Entry Denied"}
                        </span>
                      </td>
                      <td>
                        {entry.paymentStatus} (₱
                        {Number(entry.amount).toFixed(2)})
                      </td>
                      <td>
                        {entry.hasActiveBooking
                          ? `${entry.from} → ${entry.to}`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            ) : (
              <div className="no-data">
                <p>No recent taps found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}