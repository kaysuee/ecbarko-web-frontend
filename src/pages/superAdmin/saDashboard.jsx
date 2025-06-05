import React, { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get } from '../../services/ApiEndpoint';
import TotalRev from '../../assets/imgs/total-rev.png';
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

  const [userStats, setUserStats] = useState({ total: 0, newThisMonth: 0, percentageChange: 0 });
  const [cardStats, setCardStats] = useState({ active: 0, newThisMonth: 0, percentageChange: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching dashboard stats...');
        
        const [userRes, cardRes] = await Promise.all([
          get('/api/users/stats'),
          get('/api/cards/stats'),
        ]);
        
        console.log('User stats response:', userRes.data);
        console.log('Card stats response:', cardRes.data);
        
        if (userRes.data && cardRes.data) {
          setUserStats(userRes.data);
          setCardStats(cardRes.data);
        } else {
          setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
          setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
        setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
        
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate('/login');
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Super admin access required.");
        } else {
          console.log("Using fallback data for dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  const userTrend = [
    { name: 'Last Month', value: Math.max(0, userStats.total - userStats.newThisMonth) },
    { name: 'This Month', value: userStats.total },
  ];
  const cardTrend = [
    { name: 'Last Month', value: Math.max(0, cardStats.active - cardStats.newThisMonth) },
    { name: 'This Month', value: cardStats.active },
  ];

  const handleDownloadPDF = async () => {
    try {
      await generateDashboardGraphsPDF('dashboard-graphs', 'Dashboard Analytics');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

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
              <h4>+{userStats.percentageChange}%</h4>
            </div>
            <p>Gained +{userStats.newThisMonth} new users this month</p>
          </span>
        </li>
        <li>
          <span className="text">
            <h1>Active EcBarko Cards</h1>
            <div className="stats">
              <h3>{cardStats.active}</h3>
              <h4>+{cardStats.percentageChange}%</h4>
            </div>
            <p>+{cardStats.newThisMonth} new cards activated</p>
          </span>
        </li>
        <li>
          <span className="text">
            <h1>Total Revenue</h1>
            <div className="stats">
              <h3>&#8369;2,150,000</h3>
              <h4>+1.4%</h4>
            </div>
            <p>&#8369;123,000 drop in revenue</p>
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
            <h3>Total Revenue Per Month</h3>
            <i className="bx bx-search"></i>
            <i className="bx bx-filter"></i>
          </div>
          <img src={TotalRev} alt="Total Revenue" />
        </div>
      </div>
    </main>
  );
}