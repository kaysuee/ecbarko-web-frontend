import React, { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get } from '../../services/ApiEndpoint'; 
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import '../../styles/Dashboard.css';
import { generateDashboardDataPDF } from '../../utils/pdfUtils';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";

import tapEntry from '../../assets/imgs/tapEntryLogo.png';
import topUp from '../../assets/imgs/topUpLogo.png';

export default function Dashboard() {
  const user = useSelector((state) => state.Auth.user);
  const dashboardRef = useRef(null);
  const [recentTaps, setRecentTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardStats, setCardStats] = useState({ active: 0, newThisMonth: 0 });
  const [bookingPaymentsData, setBookingPaymentsData] = useState([]);

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

  // Fetch card stats
  useEffect(() => {
    const fetchCardStats = async () => {
      try {
        const cardRes = await get('/api/cards/stats');
        setCardStats(cardRes.data || { active: 0, newThisMonth: 0 });
      } catch (error) {
        console.error("Error fetching card stats:", error);
        toast.error("Failed to load card statistics");
      }
    };
    fetchCardStats();
  }, []);

  // Fetch booking payments data
  useEffect(() => {
    const fetchBookingPayments = async () => {
      try {
        const res = await get('/api/dashboard/revenue');
        if (Array.isArray(res.data)) {
          setBookingPaymentsData(res.data);
        } else {
          setBookingPaymentsData([]);
        }
      } catch (error) {
        console.error("Error fetching booking payments:", error);
        toast.error("Failed to load booking payments data");
      }
    };
    fetchBookingPayments();
  }, []);

  // Calculate statistics
  const cardTrend = [
    { name: 'Last Month', value: Math.max(cardStats.active - cardStats.newThisMonth, 0) },
    { name: 'This Month', value: cardStats.active },
  ];

  const cardPercentageChange = cardStats.active - cardStats.newThisMonth > 0
    ? ((cardStats.newThisMonth / (cardStats.active - cardStats.newThisMonth)) * 100)
    : 0;

  const bookingPaymentsCurrentMonth = bookingPaymentsData.length ? bookingPaymentsData[bookingPaymentsData.length - 1].revenue : 0;
  const bookingPaymentsPreviousMonth = bookingPaymentsData.length > 1 ? bookingPaymentsData[bookingPaymentsData.length - 2].revenue : 0;
  const bookingPaymentsChangePercent = bookingPaymentsPreviousMonth > 0 
    ? ((bookingPaymentsCurrentMonth - bookingPaymentsPreviousMonth) / bookingPaymentsPreviousMonth) * 100 
    : 0;

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

      {/* Card Statistics Section */}
      <ul className="box-info">
        <li>
          <span className="text">
            <h1>Active EcBarko Cards</h1>
            <div className="stats">
              <h3>{cardStats.active}</h3>
              <h4>{cardPercentageChange >= 0 ? `+${cardPercentageChange.toFixed(1)}%` : `${cardPercentageChange.toFixed(1)}%`}</h4>
            </div>
            <p>+{cardStats.newThisMonth} new cards activated</p>
          </span>
        </li>
        <li>
          <span className="text">
            <h1>Total Booking Payments</h1>
            <div className="stats">
              <h3>&#8369;{bookingPaymentsCurrentMonth.toLocaleString()}</h3>
              <h4>{bookingPaymentsChangePercent >= 0 ? `+${bookingPaymentsChangePercent.toFixed(2)}%` : `${bookingPaymentsChangePercent.toFixed(2)}%`}</h4>
            </div>
            <p>{bookingPaymentsChangePercent >= 0 ? `Booking payments increased this month` : `Booking payments decreased this month`}</p>
          </span>
        </li>
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

      {/* Charts Section */}
      <div className="table-data">
        <div className="active-cards">
          <div className="head">
            <h3>Active Cards</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cardTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="total-revenue">
          <div className="head">
            <h3>Booking Payments Per Month</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingPaymentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}