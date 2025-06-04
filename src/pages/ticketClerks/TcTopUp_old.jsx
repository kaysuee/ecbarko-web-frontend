import React, { useState, useEffect } from 'react';
import '../../styles/TopUp.css';

const TcTopUp = () => {
  // States for card scanning and top-up functionality
  const [currentCard, setCurrentCard] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recentTopUps, setRecentTopUps] = useState([]);
  
  // Predefined top-up amounts
  const presetAmounts = [50, 100, 200, 500, 1000];
  
  // Sample card data for demo
  const sampleCards = [
    {
      id: 1,
      name: "Nisha Kumari",
      cardNo: "1234567890",
      balance: 150.00,
    },
    {
      id: 2,
      name: "Sophia Martin",
      cardNo: "1187654321",
      balance: 30.00,
    },
    {
      id: 3,
      name: "Rudra Pratap",
      cardNo: "1122334455",
      balance: 200.00,
    }
  ];
  
  // Function to simulate card scanning
  const handleScanCard = () => {
    setIsScanning(true);
    setSuccessMessage('');
    setErrorMessage('');
    setTopUpAmount('');
    
    // Simulate scanning delay
    setTimeout(() => {
      // Randomly select a card for demo purposes
      const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)];
      setCurrentCard(randomCard);
      setIsScanning(false);
    }, 1500);
  };
  
  // Function to handle top-up amount selection
  const handleSelectAmount = (amount) => {
    setTopUpAmount(amount.toString());
  };
  
  // Function to handle input change for custom amount
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input
    if (/^\d*$/.test(value)) {
      setTopUpAmount(value);
    }
  };
  
  // Function to process top-up
  const handleProcessTopUp = () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    // Reset error message
    setErrorMessage('');
    
    // Create a copy of the current card
    const updatedCard = { ...currentCard };
    
    // Update the balance
    updatedCard.balance = parseFloat(updatedCard.balance) + parseFloat(topUpAmount);
    
    // Update the current card
    setCurrentCard(updatedCard);
    
    // Create a top-up record
    const topUpRecord = {
      id: Date.now(),
      cardNo: updatedCard.cardNo,
      name: updatedCard.name,
      amount: parseFloat(topUpAmount),
      timestamp: new Date().toLocaleString(),
      newBalance: updatedCard.balance
    };
    
    // Add to recent top-ups
    setRecentTopUps([topUpRecord, ...recentTopUps]);
    
    // Show success message
    setSuccessMessage(`Successfully added ₱${parseFloat(topUpAmount).toFixed(2)} to ${updatedCard.name}'s card`);
    
    // Reset top-up amount
    setTopUpAmount('');
  };
  
  // Function to handle card removal
  const handleRemoveCard = () => {
    setCurrentCard(null);
    setSuccessMessage('');
    setErrorMessage('');
    setTopUpAmount('');
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
                  <button className="topup-remove-button" onClick={handleRemoveCard}>Remove Card</button>
                </div>
                
                <div className="user-info">
                  <div className="user-avatar">
                    {currentCard.name.charAt(0)}
                  </div>
                  <div className="topup-user-details">
                    <h3>{currentCard.name}</h3>
                    <p>Card No: {currentCard.cardNo}</p>
                  </div>
                </div>
                
                <div className="topup-balance-display">
                  <p>Current Balance</p>
                  <h2>₱{currentCard.balance.toFixed(2)}</h2>
                </div>
                
                <div className="top-up-section">
                  <h3>Select Amount to Top-Up</h3>
                  
                  <div className="preset-amounts">
                    {presetAmounts.map(amount => (
                      <button 
                        key={amount} 
                        className={`preset-amount ${parseInt(topUpAmount) === amount ? 'selected' : ''}`}
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
                    onClick={handleProcessTopUp}
                    disabled={!topUpAmount}
                  >
                    Process Top-Up
                  </button>
                  
                  {successMessage && (
                    <div className="success-message">
                      {successMessage}
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="error-message">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-card">
                <div className="card-icon"></div>
                <p>No card detected</p>
                <button className="scan-button" onClick={handleScanCard}>
                  Simulate Card Scan
                </button>
                <p className="instructions">
                  In a real implementation, this would connect to an RFID card reader.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="recent-transactions">
          <h2>Recent Top-Ups</h2>
          
          {recentTopUps.length > 0 ? (
            <div className="transactions-list">
              {recentTopUps.map(topUp => (
                <div key={topUp.id} className="transaction-item">
                  <div className="transaction-details">
                    <p className="transaction-name">{topUp.name}</p>
                    <p className="transaction-card">Card: {topUp.cardNo}</p>
                    <p className="transaction-time">{topUp.timestamp}</p>
                  </div>
                  <div className="transaction-amount">
                    <p className="amount">+₱{topUp.amount.toFixed(2)}</p>
                    <p className="new-balance">New Balance: ₱{topUp.newBalance.toFixed(2)}</p>
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