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
        
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const statsPromise = Promise.all([
          get('/api/users/stats').catch(() => ({ data: null })),
          get('/api/cards/stats').catch(() => ({ data: null }))
        ]);
        
        const [userRes, cardRes] = await Promise.race([statsPromise, timeout]);
        
        console.log('User stats response:', userRes?.data);
        console.log('Card stats response:', cardRes?.data);
        
        if (userRes?.data) {
          setUserStats(userRes.data);
        } else {
          setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
        }
        
        if (cardRes?.data) {
          setCardStats(cardRes.data);
        } else {
          setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
        }
        
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        
        setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
        setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
        
        if (error.message === 'Request timeout') {
          console.log('Request timed out, using fallback data');
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate('/login');
          return;
        } else {
          console.log('API error, using fallback data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Force stopping loading after 15 seconds');
        setIsLoading(false);
        setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
        setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
      }
    }, 15000);

    fetchStats();

    return () => clearTimeout(timer);
  }, [user, navigate, isLoading]);

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
      <main className="dashboard">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading dashboard data...</p>
          <button 
            onClick={() => {
              setIsLoading(false);
              setUserStats({ total: 150, newThisMonth: 25, percentageChange: 20 });
              setCardStats({ active: 89, newThisMonth: 12, percentageChange: 15 });
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Skip Loading
          </button>
        </div>
      </main>
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
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}