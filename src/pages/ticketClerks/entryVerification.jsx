import React, { useState, useEffect } from "react";
import "../../styles/EntryVerification.css";
import { get, post } from "../../services/ApiEndpoint";

const EntryVerificationApp = () => {
  // Sample data
  const [currentEntry, setCurrentEntry] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (showDemo) {
      const interval = setInterval(() => {
        setCurrentEntry((prev) => {
          if (!prev || !prev.hasActiveBooking) {
            return {
              hasActiveBooking: true,
              userData: {
                name: "Nisha Kumari",
                cardNo: "1234567890",
                vehicleType: "Type 2",
                balance: 150.0,
                from: "Lucena",
                to: "Marinduque",
                bookDateTime: "2025-03-31 10:30AM",
                timestamp: "2025-04-03 10:25 AM",
              },
            };
          } else {
            // Show denied entry
            return {
              hasActiveBooking: false,
              userData: {
                name: "Sophia Martin",
                cardNo: "1187654321",
                vehicleType: "Type 1",
                balance: 30.0,
                timestamp: "2025-04-03 10:30 AM",
              },
            };
          }
        });
      }, 5000); // Switch every 5 seconds

      return () => clearInterval(interval);
    }
  }, [showDemo]);

  // // Load initial state
  // useEffect(() => {
  //   // Start with denied entry
  //   setCurrentEntry({
  //     hasActiveBooking: false,
  //     userData: {
  //       name: "Sophia Martin",
  //       cardNo: "1187654321",
  //       vehicleType: "Motorcycle",
  //       balance: 30.00,
  //       timestamp: "2025-04-03 10:30 AM"
  //     }
  //   });
  // }, []);

  useEffect(() => {
    let isMounted = true;
    let lastCardNo = null;
    let isScanning = false;
    let missedCount = 0;
    const maxMissBeforeRemove = 2; // remove card if missed for 2 cycles
  
    const scanLoop = async () => {
      if (!isMounted || isScanning) return;
  
      isScanning = true;
  
      try {
        const response = await get("/api/scan-nfc");
        const newCardNo = response?.data?.cardNo || null;
  
        if (newCardNo) {
          missedCount = 0; // reset miss count
  
          if (newCardNo !== lastCardNo) {
            lastCardNo = newCardNo;
            console.log("📡 New NFC card detected:", newCardNo);
  
            const cardResponse = await get(`/api/auth/card/${newCardNo}`);
            const cardData = cardResponse.data;
  
            const isAllowed = newCardNo === cardData.card.cardNumber;
            let latestbalance = "";
  
            if (isAllowed && cardData.activebooking) {
              const payment = await post(`/api/auth/card`, {
                cardNo: newCardNo,
                payment: cardData.activebooking.payment,
              });
              latestbalance = payment.data.card.balance;
            } else {
              latestbalance = cardData.card.balance;
            }
  
            setCurrentEntry({
              hasActiveBooking: cardData.activebooking ? isAllowed : !isAllowed,
              userData: {
                name: isAllowed ? cardData.card.name || "Unknown" : "Unknown",
                cardNo: newCardNo,
                vehicleType: isAllowed ? cardData.card.type || "Unknown" : "Unknown",
                balance: isAllowed ? Number(latestbalance) || 0.0 : 0.0,
                from:
                  isAllowed && cardData.activebooking
                    ? cardData.activebooking.departureLocation || "Unknown"
                    : "Unknown",
                to:
                  isAllowed && cardData.activebooking
                    ? cardData.activebooking.arrivalLocation || "Unknown"
                    : "Unknown",
                bookDateTime:
                  isAllowed && cardData.activebooking
                    ? new Date(cardData.activebooking.departDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) +
                      " at " +
                      cardData.activebooking.departTime
                    : "Unknown",
                timestamp: new Date().toLocaleString(),
              },
            });

            await post("/api/auth/tapHistory", {
              name: isAllowed ? cardData.card.name || "Unknown" : "Unknown",
              cardNo: newCardNo,
              vehicleType: isAllowed ? cardData.card.type || "Unknown" : "Unknown",
              hasActiveBooking: !!cardData.activebooking,
              from: cardData.activebooking?.departureLocation || null,
              to: cardData.activebooking?.arrivalLocation || null,
              paymentStatus: cardData.activebooking ? "Paid" : "Not Applicable",
              amount: cardData.activebooking ? Number(cardData.activebooking.payment) : 0,
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          // No card detected
          if (lastCardNo) {
            missedCount++;
            if (missedCount >= maxMissBeforeRemove) {
              console.log("📴 NFC card removed");
              lastCardNo = null;
              setCurrentEntry(null);
            }
          }
        }
      } catch (err) {
        console.error("❌ NFC scan error:", err);
      } finally {
        isScanning = false;
        if (isMounted) setTimeout(scanLoop, 200); // Fast retry
      }
    };
  
    scanLoop();
  
    return () => {
      isMounted = false;
    };
  }, []);
  

  const handleScanClick = () => {
    // setCurrentEntry(null);
    // console.log("🛰️ Starting NFC scan...");
    // const scanInterval = setInterval(async () => {
    //   try {
    //     // Fetch the latest NFC scan data
    //     const response = await get('/api/scan-nfc');
    //     const data = response.data;
    //     console.log("📡 NFC Scan Data:", data);
    //     if (data.cardNo) {
    //       // Fetch card details using card number
    //       const cardResponse = await get(`/api/auth/card/${data.cardNo}`);
    //       const cardData = cardResponse.data[0];
    //       const isAllowed = data.cardNo === cardData.cardNumber;
    //       console.log("📡 Card data:", cardData);
    //       setCurrentEntry({
    //         hasActiveBooking: isAllowed,
    //         userData: {
    //           name: isAllowed ? cardData.name : "Unknown",
    //           cardNo: data.cardNo,
    //           vehicleType: isAllowed ? cardData.type : "Unknown",
    //           balance: isAllowed ? Number(cardData.balance): 0.0,
    //           from: isAllowed ? cardData.from : "Unknown",
    //           to: isAllowed ? cardData.to  : "Unknown",
    //           bookDateTime: isAllowed ? cardData.bookDateTime : "Unknown",
    //           timestamp: new Date().toLocaleString(),
    //         },
    //       });
    //       clearInterval(scanInterval);
    //     }
    //   } catch (error) {
    //     console.error("❌ Error fetching NFC scan or card data:", error);
    //     clearInterval(scanInterval); // Stop polling on error
    //   }
    // }, 3000);
  };

  return (
    <div className="entry-app-container">
      <header className="entry-app-header">
        <h1>EcBarko Entry Verification</h1>
        <div className="controls">
          {/* <button className="scan-button" onClick={handleScanClick}>
            Simulate Scan
          </button>
          <label className="demo-toggle">
            <input
              type="checkbox"
              checked={showDemo}
              onChange={() => setShowDemo(!showDemo)}
            />
            Auto Demo Mode
          </label> */}
        </div>
      </header>

      <div className="verification-display">
        {currentEntry ? (
          <div
            className={`entry-card ${
              currentEntry.hasActiveBooking ? "allowed" : "denied"
            }`}
          >
            <div className="card-header">
              {currentEntry.hasActiveBooking
                ? "Booking Verified - Entry Allowed"
                : "No Booking - Entry Denied"}
            </div>

            <div className="card-content">
              <div className="user-details">
                <div className="detail-row">
                  <div className="detail-label">Name</div>
                  <div className="detail-value">
                    {currentEntry.userData.name}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Vehicle Type</div>
                  <div className="detail-value">
                    {currentEntry.userData.vehicleType}
                  </div>
                </div>

                {!currentEntry.hasActiveBooking && (
                  <>
                    <div className="booking-status-divider"></div>
                    <div className="booking-status-indicator">
                      No Active Booking
                    </div>
                  </>
                )}

                {currentEntry.hasActiveBooking && (
                  <div className="route-details">
                    <div className="route-divider"></div>
                    <div className="route-grid">
                      <div className="route-header">From</div>
                      <div className="route-header">To</div>
                      <div className="route-header">Book Date & Time</div>

                      <div className="route-value">
                        {currentEntry.userData.from}
                      </div>
                      <div className="route-value">
                        {currentEntry.userData.to}
                      </div>
                      <div className="route-value">
                        {currentEntry.userData.bookDateTime}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <div className="detail-label">Card No</div>
                  <div className="detail-value">
                    {currentEntry.userData.cardNo}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Balance</div>
                  <div className="detail-value">
                    ₱{currentEntry.userData.balance.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="timestamp">
                Timestamp: {currentEntry.userData.timestamp}
              </div>
            </div>
          </div>
        ) : (
          <div className="loading-card">
            <div className="scanner-animation"></div>
            <p>Scanning card...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryVerificationApp;
