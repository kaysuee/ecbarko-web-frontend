import React, { useState, useEffect } from "react";
import "../../styles/TopUp.css";
import { get, post } from "../../services/ApiEndpoint";

const TcTopUp = () => {
  const [currentCard, setCurrentCard] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recentTopUps, setRecentTopUps] = useState([]);

  const presetAmounts = [50, 100, 200, 500, 1000];

  const sampleCards = [
    {
      id: 1,
      name: "Nisha Kumari",
      cardNo: "1234567890",
      balance: 150.0,
    },
    {
      id: 2,
      name: "Sophia Martin",
      cardNo: "1187654321",
      balance: 30.0,
    },
    {
      id: 3,
      name: "Rudra Pratap",
      cardNo: "1122334455",
      balance: 200.0,
    },
  ];

  const getUserInitial = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const loadCardHistory = async (card) => {
    console.log("🛰️load card history", card);
    try {
      const response = await get(`/api/auth/cardHistory/${card.userId}`);
      const data = response.data;
      console.log("📡 Card history data:", data);

      if (data) {
        setRecentTopUps(data);
        console.log("📡 Card data:", recentTopUps);
      } else {
        console.log("❌ Unauthorized card access attempt.");
        return;
      }
    } catch (error) {
      console.error("❌ Error load card history:", error);
      clearInterval(scanInterval);
    }
  };

  const refreshBalance = async (card) => {
    console.log("🛰️refresh balance", card);
    try {
      const cardResponse = await get(`/api/auth/card/${card}`);
      const cardData = cardResponse.data;
      console.log("📡 refresh balance data:", cardData);

      if (cardData) {
        setCurrentCard(cardData.card);
      } else {
        console.log("❌ Unauthorized card access attempt.");
        return;
      }
    } catch (error) {
      console.error("❌ Error load card history:", error);
    }
  };

  const startNfcScan = async () => {
    let scanInterval;
    console.log("🛰️ Starting NFC scan...");

    scanInterval = setInterval(async () => {
      try {
        const response = await get("/api/scan-nfc");
        const data = response.data;

        if (data.cardNo) {
          const cardResponse = await get(`/api/auth/card/${data.cardNo}`);
          const cardData = cardResponse.data;

          const isAllowed = data.cardNo === cardData.card.cardNumber;

          if (isAllowed) {
            setIsScanning(false);
            console.log("📡 Card data:", cardData.card);
            setCurrentCard(cardData.card);
            loadCardHistory(cardData.card);
          } else {
            console.log("❌ Unauthorized card access attempt.");
            setRecentTopUps(null);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching NFC scan or card data:", error);
      }
    }, 1000);
  };

  const handleScanCard = () => {
    setIsScanning(true);
    setSuccessMessage("");
    setErrorMessage("");
    setTopUpAmount("");

    startNfcScan();

    setIsScanning(false);
  };

  const handleSelectAmount = (amount) => {
    setTopUpAmount(amount.toString());
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTopUpAmount(value);
    }
  };

  const handleProcessTopUp = async (cardnumber, userId) => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    setErrorMessage("");

    try {
      const response = await post(`/api/auth/buyload/${cardnumber}`, {
        payment: topUpAmount,
        userId: userId,
      });

      const data = response.data;
      console.log("📡 Card buy load:", data);

      if (data) {
        loadCardHistory(data.card);
        setSuccessMessage(
          `Successfully added ₱${parseFloat(topUpAmount).toFixed(
            2
          )} to ${cardnumber}'s card`
        );
        refreshBalance(cardnumber);
        setTopUpAmount("");
      } else {
        console.log("❌ Unauthorized card access attempt.");
        return;
      }
    } catch (error) {
      console.error("❌ Error load card history:", error);
    }
  };

  const handleRemoveCard = () => {
    setCurrentCard(null);
    setSuccessMessage("");
    setErrorMessage("");
    setTopUpAmount("");
  };

  return (
    <div className="topup-container">
      <div className="topup-header">
        <h1>EcBarko Card Top-Up</h1>
        <p className="subtitle">Add funds to passenger cards</p>
      </div>

      <div className="topup-content">
        <div className="card-section">
          <div className="card-reader">
            {isScanning ? (
              <div className="scanning-animation">
                <div className="scanner-beam"></div>
                <p>Scanning card...</p>
              </div>
            ) : currentCard ? (
              <div className="card-details">
                <div className="card-header">
                  <h2>Card Information</h2>
                  <button
                    className="topup-remove-button"
                    onClick={handleRemoveCard}
                  >
                    Remove Card
                  </button>
                </div>

                <div className="user-info">
                  <div className="user-avatar">{getUserInitial(currentCard.name)}</div>
                  <div className="topup-user-details">
                    <h3>{currentCard.name}</h3>
                    <p>Card No: {currentCard.cardNumber}</p>
                  </div>
                </div>

                <div className="topup-balance-display">
                  <p>Current Balance</p>
                  <h2>₱{Number(currentCard.balance).toFixed(2)}</h2>
                </div>

                <div className="top-up-section">
                  <h3>Select Amount to Top-Up</h3>

                  <div className="preset-amounts">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        className={`preset-amount ${
                          parseInt(topUpAmount) === amount ? "selected" : ""
                        }`}
                        onClick={() => handleSelectAmount(amount)}
                      >
                        ₱{amount}
                      </button>
                    ))}
                  </div>

                  <div className="topup-custom-amount">
                    <p>Or enter custom amount:</p>
                    <div className="amount-input">
                      <span className="peso-sign">₱</span>
                      <input
                        type="text"
                        value={topUpAmount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <button
                    className="process-button"
                    onClick={() =>
                      handleProcessTopUp(
                        currentCard.cardNumber,
                        currentCard.userId
                      )
                    }
                    disabled={!topUpAmount}
                  >
                    Process Top-Up
                  </button>

                  {successMessage && (
                    <div className="success-message">{successMessage}</div>
                  )}

                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-card">
                <div className="card-icon"></div>
                <p>No card detected</p>
                <button
                  className="scan-button"
                  onClick={() => {
                    handleScanCard();
                    setIsScanning(true);
                  }}
                >
                  Simulate Card Scan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="recent-transactions">
          <h2>Recent Top-Ups</h2>

          {recentTopUps.length > 0 ? (
            <div className="transactions-list">
              {recentTopUps.map((topUp) => (
                <div className="transaction-item">
                  <div className="transaction-details">
                    <p className="transaction-name">{currentCard.name}</p>
                    <p className="transaction-time">{topUp.dateTransaction}</p>
                  </div>
                  <div className="transaction-amount">
                    <p className="amount">
                      +₱{Number(topUp.payment).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transactions">
              <p>No recent top-ups</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TcTopUp;