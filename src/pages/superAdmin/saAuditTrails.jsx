import { useEffect, useState, useMemo } from 'react';
import { get, post, put } from '../../services/ApiEndpoint';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/AuditTrails.css';
import { generateAuditTrailsPDF } from '../../utils/pdfUtils';

export default function AuditTrails() {
  const [auditrails, setAudit] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('latest');
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchAudit(); }, []);
  
  const fetchAudit = async () => {
    try {
      const res = await get('/api/audittrails');
      setAudit(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch audit trails');
    }
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleSortChange = e => {
    const value = e.target.value;
    if (value === '') {
      setSortField('latest');
    } else {
      setSortField(value);
      if (value === 'date' && !sortOrder) {
        setSortOrder('desc');
      }
    }
    setCurrentPage(1); 
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const resetSorting = () => { 
  setSearchTerm(''); 
  setSortField('latest'); 
  setSortOrder('desc');
  setCurrentPage(1);
  };

  const parseDate = (dateString) => {
    return new Date(dateString);
  };

  const displayedAudit = useMemo(() => {
    let list = [...auditrails];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => 
        (s.date && s.date.toLowerCase().includes(term)) ||
        (s.userID && s.userID.toLowerCase().includes(term)) ||
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.action && s.action.toLowerCase().includes(term))
      );
    }
    
    if (sortField) {
      if (sortField === 'latest') {
        list.sort((a, b) => new Date(b.date || b._id) - new Date(a.date || a._id));
      } else if (sortField === 'oldest') {
        list.sort((a, b) => new Date(a.date || a._id) - new Date(b.date || b._id));
      } else {
        list.sort((a, b) => {
          let va, vb;
          if (sortField === 'date') {
            va = parseDate(a[sortField]);
            vb = parseDate(b[sortField]);
          } else {
            va = a[sortField] || '';
            vb = b[sortField] || '';
          }
          let comparison;
          if (sortField === 'date') {
            comparison = va.getTime() - vb.getTime();
          } else {
            comparison = va.toString().localeCompare(vb.toString());
          }
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
    }
    
    return list;
  }, [auditrails, searchTerm, sortField, sortOrder]);

  const totalItems = displayedAudit.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = displayedAudit.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const handleDownloadPDF = () => {
  generateAuditTrailsPDF(displayedAudit, 'audit-trails-report');
};

  return (
    <div className="bookings">
    <main>
      <Toaster position="top-center" />
      <div className="head-title">
        <div className="left">
          <h1>Audit Trails</h1>
          <ul className="breadcrumb"><li><a href="#">Audit Trails</a></li></ul>
        </div>
        <a href="#" className="btn-download" onClick={handleDownloadPDF}>
          <i className="bx bxs-cloud-download"></i>
          <span className="text">Download PDF</span>
        </a>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Audit Trails</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search Audit Trails..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="bx bx-search"></i>
            </div>
            <div className="sort-container">
              <select className="sort-select" value={sortField || ''} onChange={handleSortChange}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="userID">User ID</option>
                <option value="action">Action</option>
              </select>
            </div>
            <i className="bx bx-sort" onClick={handleSortOrderToggle} title="Toggle Sort Order"></i>
            <i className="bx bx-reset" onClick={resetSorting} title="Reset Filters and Sort"></i>
          </div>

          <div className="pagination-controls">
            <div className="items-per-page">
              <label>Show: </label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span> entries</span>
            </div>
            <div className="showing-info">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              {searchTerm && ` (filtered from ${auditrails.length} total entries)`}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(s => (
                  <tr key={s._id}>
                    <td>{s.date}</td>
                    <td>{s.userID}</td>
                    <td>{s.name}</td>
                    <td>{s.action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    {searchTerm ? 'No audit trails found matching your search.' : 'No audit trails found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                First
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}