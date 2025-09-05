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
import { generateDashboardGraphsPDF } from '../../utils/pdfUtils';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  const [userStats, setUserStats] = useState({ total: 0, newThisMonth: 0 });
  const [cardStats, setCardStats] = useState({ active: 0, newThisMonth: 0 });
  const [revenueData, setRevenueData] = useState([]);

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

  // Fetch revenue (total + monthly breakdown)
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await get('/api/dashboard/revenue');
        if (Array.isArray(res.data)) {
          setRevenueData(res.data);
        } else {
          setRevenueData([]);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        toast.error("Failed to load sales data");
      }
    };
    fetchRevenue();
  }, []);

  // Derived statistics
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

  const revenueCurrentMonth = revenueData.length ? revenueData[revenueData.length - 1].revenue : 0;
  const revenuePreviousMonth = revenueData.length > 1 ? revenueData[revenueData.length - 2].revenue : 0;
  const revenueChangePercent = revenuePreviousMonth > 0 
    ? ((revenueCurrentMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100 
    : 0;

  const handleDownloadPDF = async () => {
    try {
      await generateDashboardGraphsPDF('dashboard-graphs', 'Dashboard Analytics');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
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
            <h1>Total Sales</h1>
            <div className="stats">
              <h3>&#8369;{revenueCurrentMonth.toLocaleString()}</h3>
              <h4>{revenueChangePercent >= 0 ? `+${revenueChangePercent.toFixed(2)}%` : `${revenueChangePercent.toFixed(2)}%`}</h4>
            </div>
            <p>{revenueChangePercent >= 0 ? `Sales increased this month` : `Sales decreased this month`}</p>
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
            <i className="bx bx-search"></i>
            <i className="bx bx-sort"></i>
            <i className="bx bx-reset" onClick={() => { }} title="Reset"></i>
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
            <h3>Total Sales Per Month</h3>
            <i className="bx bx-search"></i>
            <i className="bx bx-filter"></i>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
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
