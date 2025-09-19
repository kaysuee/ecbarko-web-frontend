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

export default function Dashboard() {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  const [userStats, setUserStats] = useState({ total: 0, newThisMonth: 0 });
  const [cardStats, setCardStats] = useState({ active: 0, newThisMonth: 0 });
  const [bookingPaymentsData, setBookingPaymentsData] = useState([]);

  // Fetch user & card stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userRes, cardRes] = await Promise.all([
          get('/api/users/stats'),
          get('/api/cards/stats'),
        ]);
        setUserStats(userRes.data || { total: 0, newThisMonth: 0 });
        setCardStats(cardRes.data || { active: 0, newThisMonth: 0 });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      }
    };
    fetchStats();
  }, []);

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

  const userTrend = [
    { name: 'Last Month', value: Math.max(userStats.total - userStats.newThisMonth, 0) },
    { name: 'This Month', value: userStats.total },
  ];
  const cardTrend = [
    { name: 'Last Month', value: Math.max(cardStats.active - cardStats.newThisMonth, 0) },
    { name: 'This Month', value: cardStats.active },
  ];

  const userPercentageChange = userStats.total - userStats.newThisMonth > 0 
    ? ((userStats.newThisMonth / (userStats.total - userStats.newThisMonth)) * 100)
    : 0;

  const cardPercentageChange = cardStats.active - cardStats.newThisMonth > 0
    ? ((cardStats.newThisMonth / (cardStats.active - cardStats.newThisMonth)) * 100)
    : 0;

  const bookingPaymentsCurrentMonth = bookingPaymentsData.length ? bookingPaymentsData[bookingPaymentsData.length - 1].revenue : 0;
  const bookingPaymentsPreviousMonth = bookingPaymentsData.length > 1 ? bookingPaymentsData[bookingPaymentsData.length - 2].revenue : 0;
  const bookingPaymentsChangePercent = bookingPaymentsPreviousMonth > 0 
    ? ((bookingPaymentsCurrentMonth - bookingPaymentsPreviousMonth) / bookingPaymentsPreviousMonth) * 100 
    : 0;

  const handleDownloadPDF = async () => {
    try {
      await generateDashboardDataPDF("admin_dashboard_report", "Admin Dashboard", {
        userStats,
        cardStats,
        revenueCurrentMonth: bookingPaymentsCurrentMonth,
        revenueChangePercent: bookingPaymentsChangePercent,
        userPercentageChange,
        cardPercentageChange
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

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
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>

      <ul className="box-info">
        <li>
          <span className="text">
            <h1>Total Users</h1>
            <div className="stats">
              <h3>{userStats.total}</h3>
              <h4>{userPercentageChange >= 0 ? `+${userPercentageChange.toFixed(1)}%` : `${userPercentageChange.toFixed(1)}%`}</h4>
            </div>
            <p>Gained +{userStats.newThisMonth} new users this month</p>
          </span>
        </li>
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

      <div className="table-data">
        <div className="totalUsers">
          <span className="lineGraph">
            <h3>Total Users</h3>
            <h4>User Growth</h4>
          </span>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

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
