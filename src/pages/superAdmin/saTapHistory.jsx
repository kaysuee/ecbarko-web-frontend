import React, { useState, useEffect } from "react";
import { get } from "../../services/ApiEndpoint";
import "../../styles/History.css";
import "../../styles/table-compression.css";
import { generateTablePDF } from '../../utils/pdfUtils';

const History = ({ hideHeader = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tapHistory, setTapHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await get("/api/auth/tapHistory");
        setTapHistory(response.data);
      } catch (error) {
        console.error("❌ Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = tapHistory.filter(
    (entry) =>
      (entry.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.cardNo || "").includes(searchTerm) ||
      (entry.vehicleType || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleDownloadPDF = async () => {
    try {
      await generateTablePDF('.table-data table', 'TapHistory', 'Tap History Records');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };
  
  const resetSorting = () => { setSearchTerm(''); setSortField(null); };

  return (
    <div className="history">
      <main> 
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
            <a href="#" className="btn-download" onClick={handleDownloadPDF}>
              <i className="bx bxs-cloud-download"></i>
              <span className="text">Download PDF</span>
            </a>
          </div>
        )}
        <div className="card-table">
          <div className="order">
            <div className="head">
              <div className="hstry-search-container">
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bx bx-search"></i>
              </div>
              <i className="bx bx-reset" onClick={resetSorting} title="Reset Filters and Sort"></i>
            </div>
            <div className="table-container">
              <table className="compressed-table">
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
                {filteredHistory.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <div className="avatar">
                        <div className="initial-avatar">{entry.name.charAt(0)}</div>
                      </div>
                      <span>{entry.name}</span>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
