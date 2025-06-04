import React, { useState, useEffect } from 'react';
import '../../styles/History.css';

const History = ({ hideHeader = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tapHistory, setTapHistory] = useState([
    {
      id: 1,
      name: "Nisha Kumari",
      cardNo: "1234567890",
      vehicleType: "Type 2",
      hasActiveBooking: true,
      timestamp: "2025-04-03 09:15 AM",
      from: "Lucena",
      to: "Marinduque",
      paymentStatus: "Paid",
      amount: "₱150.00"
    },
    {
      id: 2,
      name: "Sophia Martin",
      cardNo: "1187654321",
      vehicleType: "Type 1",
      hasActiveBooking: false,
      timestamp: "2025-04-03 09:25 AM",
      paymentStatus: "Not Applicable",
      amount: "₱30.00"
    },
    {
      id: 3,
      name: "Rudra Pratap",
      cardNo: "1122334455",
      vehicleType: "Type 4",
      hasActiveBooking: true,
      timestamp: "2025-04-03 09:40 AM",
      from: "Marinduque",
      to: "Lucena",
      paymentStatus: "Paid",
      amount: "₱200.00"
    },
    {
      id: 4,
      name: "Trisha Norton",
      cardNo: "3344556677",
      vehicleType: "Type 2",
      hasActiveBooking: true,
      timestamp: "2025-04-03 10:05 AM",
      from: "Lucena",
      to: "Marinduque",
      paymentStatus: "Paid",
      amount: "₱150.00"
    },
    {
      id: 5,
      name: "Elvin Bond",
      cardNo: "7788990011",
      vehicleType: "Type 2",
      hasActiveBooking: false,
      timestamp: "2025-04-03 10:15 AM",
      paymentStatus: "Insufficient Balance",
      amount: "₱40.00"
    },
    {
      id: 6, 
      name: "Jolene Orr",
      cardNo: "5566778899",
      vehicleType: "Type 1",
      hasActiveBooking: false,
      timestamp: "2025-04-03 10:20 AM",
      paymentStatus: "Not Applicable",
      amount: "₱25.00"
    },
    {
      id: 7,
      name: "Aryan Roy",
      cardNo: "6677889900",
      vehicleType: "Type 3",
      hasActiveBooking: true,
      timestamp: "2025-04-03 10:45 AM",
      from: "Lucena",
      to: "Marinduque",
      paymentStatus: "Paid",
      amount: "₱250.00"
    }
  ]);

  // Filter history based on search term
  const filteredHistory = tapHistory.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.cardNo.includes(searchTerm) ||
    entry.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulated data fetching
  useEffect(() => {
    // In a real implementation, you would fetch data from API
    // Example:
    // const fetchHistory = async () => {
    //   try {
    //     const response = await fetch('/api/history');
    //     const data = await response.json();
    //     setTapHistory(data);
    //   } catch (error) {
    //     console.error('Error fetching history:', error);
    //   }
    // };
    //
    // fetchHistory();
  }, []);

    const gethistory = async (card) => {
  
          console.log("🛰️load card history", card);
            try {
              const response = await get(`/api/auth/tapHistory`);
              const data = response.data;
              console.log("📡 Card history data:", data);
     
              if (data) {
             
                  
                  setRecentTopUps(data);
                  console.log("📡 Card data:",recentTopUps);
                }else{
                  console.log("❌ Unauthorized card access attempt.");
                  return;
                }
              
            } catch (error) {
              console.error("❌ Error load card history:", error);
              clearInterval(scanInterval);
            }
        };

 return (
    <div className="history">
      <main>
        {/* ONLY render the header/search block if hideHeader === false */}
        {!hideHeader && (
          <div className="head-title">
            <div className="left">
              <h1>Tap History</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">History</a>
                </li>
              </ul>
            </div>
            <div className="hstry-search-container">
              <input
                type="text"
                placeholder="Search by name, card no, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bx bx-search"></i>
            </div>
          </div>
        )}

        {/* Always render the table-data section */}
        <div className="table-data">
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
              {filteredHistory.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div className="avatar">
                      <div className="initial-avatar">
                        {entry.name.charAt(0)}
                      </div>
                    </div>
                    <p>{entry.name}</p>
                  </td>
                  <td>{entry.cardNo}</td>
                  <td>{entry.vehicleType}</td>
                  <td>{entry.timestamp}</td>
                  <td>
                    <span className={`status ${entry.hasActiveBooking ? 'active' : 'deactivated'}`}>
                      {entry.hasActiveBooking ? 'Entry Allowed' : 'Entry Denied'}
                    </span>
                  </td>
                  <td>{entry.paymentStatus} ({entry.amount})</td>
                  <td>
                    {entry.hasActiveBooking
                      ? `${entry.from} → ${entry.to}`
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default History