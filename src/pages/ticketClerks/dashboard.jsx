import React, { useState, useEffect, useRef } from 'react'
import '../../styles/tDashboard.css'
import { get, post } from '../../services/ApiEndpoint'
import History from './tapHistory'

function Dashboard() {
  const cardWidth = 300
  const cardGap = 100 
  const [entries, setEntries] = useState([
    {
      hasActiveBooking: true,
      userData: {
        name: "Nisha Kumari",
        cardNo: "1234567890",
        vehicleType: "Type 2",
        balance: 150.0,
        from: "Lucena",
        to: "Marinduque",
        bookDateTime: "2025-03-31 10:30AM",
        timestamp: "2025-04-03 09:15 AM"
      }
    },
    {
      hasActiveBooking: false,
      userData: {
        name: "Sophia Martin",
        cardNo: "1187654321",
        vehicleType: "Type 1",
        balance: 30.0,
        from: "Unknown",
        to: "Unknown",
        bookDateTime: "Unknown",
        timestamp: "2025-04-03 09:25 AM"
      }
    },
    {
      hasActiveBooking: true,
      userData: {
        name: "Rudra Pratap",
        cardNo: "1122334455",
        vehicleType: "Type 4",
        balance: 200.0,
        from: "Marinduque",
        to: "Lucena",
        bookDateTime: "2025-04-01 11:00AM",
        timestamp: "2025-04-03 09:40 AM"
      }
    }
  ])

  // Always show scanner card as the fourth entry
  const displayEntries = [...entries, { isScanner: true }]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const entryFlexRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const updateViewportWidth = () => {
      if (wrapperRef.current) {
        setViewportWidth(wrapperRef.current.clientWidth)
      }
    }

    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const scrollRight = () => {
    const maxIndex = getMaxScrollIndex()
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const getMaxScrollIndex = () => {
    if (viewportWidth === 0) return 0

    const totalCards = displayEntries.length
    const cardsPerView = Math.floor(viewportWidth / (cardWidth + cardGap))
    
    // If we can show all cards at once, no scrolling needed
    if (cardsPerView >= totalCards) {
      return 0
    }
    
    // Maximum index is total cards minus cards we can show at once
    const maxIndex = totalCards - cardsPerView
    return Math.max(0, maxIndex)
  }

  const translateX = -currentIndex * (cardWidth + cardGap)
  const maxScrollIndex = getMaxScrollIndex()

  // NFC scanning effect: poll every second until a valid card is found
  useEffect(() => {
    let scanInterval

    const startNfcScan = () => {
      scanInterval = setInterval(async () => {
        try {
          const response = await get('/api/scan-nfc')
          if (response.status !== 200) return
          const data = response.data
          if (!data.cardNo) return

          const cardResponse = await get(`/api/auth/card/${data.cardNo}`)
          const cardData = cardResponse.data
          const isAllowed = data.cardNo === cardData.card.cardNumber
          let latestBalance = cardData.card.balance

          if (isAllowed && cardData.activebooking) {
            const payment = await post('/api/auth/card', {
              cardNo: data.cardNo,
              payment: cardData.activebooking.payment,
            })
            latestBalance = payment.data.card.balance
          }

          const newEntry = {
            hasActiveBooking: isAllowed,
            userData: {
              name: isAllowed ? cardData.card.name || 'Unknown' : 'Unknown',
              cardNo: data.cardNo,
              vehicleType: isAllowed ? cardData.card.type || 'Unknown' : 'Unknown',
              balance: isAllowed ? Number(latestBalance) : 0.0,
              from:
                isAllowed && cardData.activebooking
                  ? cardData.activebooking.departureLocation || 'Unknown'
                  : 'Unknown',
              to:
                isAllowed && cardData.activebooking
                  ? cardData.activebooking.arrivalLocation || 'Unknown'
                  : 'Unknown',
              bookDateTime:
                isAllowed && cardData.activebooking
                  ? new Date(cardData.activebooking.departDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) +
                    ' at ' +
                    cardData.activebooking.departTime
                  : 'Unknown',
              timestamp: new Date().toLocaleString(),
            },
          }

          // Prepend the newest scan entry and drop the oldest if there are more than 3 previous entries
          setEntries(prev => [newEntry, ...prev.slice(0, 2)])
          clearInterval(scanInterval)
        } catch {
          clearInterval(scanInterval)
        }
      }, 1000)
    }

    startNfcScan()
    return () => clearInterval(scanInterval)
  }, [])

  return (
    <div
      className="dashboard-container"
      style={{ overflowY: 'auto', height: '100vh', padding: '1rem' }}
    >
      <div
        className="entry-scroll-controls"
        style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
      >
        {currentIndex > 0 && (
          <button
            onClick={scrollLeft}
            className="scroll-btn"
            style={{ 
              width: '40px', 
              height: '40px', 
              flex: '0 0 auto', 
              marginRight: '0.5rem',
              borderRadius: '50%',
              border: '2px solid #ccc',
              backgroundColor: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#666',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5'
              e.target.style.borderColor = '#999'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff'
              e.target.style.borderColor = '#ccc'
            }}
          >
            ◀
          </button>
        )}

        <div
          className="entry-scroll-wrapper"
          style={{ overflow: 'hidden', flexGrow: 1 }}
          ref={wrapperRef}
        >
          <div
            className="entry-flex-container"
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '0',
              transform: `translateX(${translateX}px)`,
              transition: 'transform 0.3s ease',
              width: `${displayEntries.length * (cardWidth + cardGap) - cardGap}px`,
            }}
            ref={entryFlexRef}
          >
            {displayEntries.map((entry, idx) => (
              <div key={idx} style={{ flex: '0 0 300px' }}>
                {entry.isScanner ? (
                  <div className="entry-card loading-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                    border: '2px dashed #4a90e2',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div className="scanner-animation" style={{
                      width: '80px',
                      height: '80px',
                      border: '4px solid #4a90e2',
                      borderRadius: '50%',
                      borderTop: '4px solid transparent',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '20px'
                    }}></div>
                    <p style={{
                      color: '#4a90e2',
                      fontSize: '18px',
                      fontWeight: '500',
                      margin: '0',
                      textAlign: 'center'
                    }}>Scanning for card...</p>
                    <p style={{
                      color: '#666',
                      fontSize: '14px',
                      margin: '8px 0 0 0',
                      textAlign: 'center'
                    }}>Please tap your card on the reader</p>
                    <style jsx>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : (
                  <div className={`entry-card ${entry.hasActiveBooking ? 'allowed' : 'denied'}`}>
                    <div className="card-header">
                      {entry.hasActiveBooking
                        ? 'Booking Verified - Entry Allowed'
                        : 'No Booking - Entry Denied'}
                    </div>
                    <div className="card-content">
                      <div className="user-image" />
                      <div className="user-details">
                        <div className="detail-row">
                          <div className="detail-label">Name</div>
                          <div className="detail-value">{entry.userData.name}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label">Vehicle Type</div>
                          <div className="detail-value">{entry.userData.vehicleType}</div>
                        </div>
                        {!entry.hasActiveBooking && (
                          <>
                            <div className="booking-status-divider"></div>
                            <div className="booking-status-indicator">No Active Booking</div>
                          </>
                        )}
                        {entry.hasActiveBooking && (
                          <div className="route-details">
                            <div className="route-divider"></div>
                            <div className="route-grid">
                              <div className="route-header">From</div>
                              <div className="route-header">To</div>
                              <div className="route-header">Book Date &amp; Time</div>
                              <div className="route-value">{entry.userData.from}</div>
                              <div className="route-value">{entry.userData.to}</div>
                              <div className="route-value">{entry.userData.bookDateTime}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-details">
                        <div className="detail-row">
                          <div className="detail-label">Card No</div>
                          <div className="detail-value">{entry.userData.cardNo}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label">Balance</div>
                          <div className="detail-value">₱{entry.userData.balance.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="timestamp">Timestamp: {entry.userData.timestamp}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {currentIndex < maxScrollIndex && (
          <button
            onClick={scrollRight}
            className="scroll-btn"
            style={{ 
              width: '40px', 
              height: '40px', 
              flex: '0 0 auto', 
              marginLeft: '0.5rem',
              borderRadius: '50%',
              border: '2px solid #ccc',
              backgroundColor: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#666',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5'
              e.target.style.borderColor = '#999'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff'
              e.target.style.borderColor = '#ccc'
            }}
          >
            ▶
          </button>
        )}
      </div>

      <div style={{ height: '1rem' }} />

      <div className="history-table-container">
        <History hideHeader={true} />
      </div>
    </div>
  )
}

export default Dashboard