import '../../styles/ecBarko-card.css';
import profile from '../../assets/imgs/profile.png';

export default function EcBarkoCard() {
  const accounts = [
    {
      name: "Nisha Kumari",
      id: "1001",
      cardNumber: "1234-5678-9101",
      balance: "₱30,000.00",
      type: "Type 1",
      status: "active",
      lastActive: "2025-02-18",
    },
    {
      name: "Sophia",
      id: "1002",
      cardNumber: "1234-5678-9102",
      balance: "₱0.00",
      type: "Type 2",
      status: "deactivated",
      lastActive: "2025-02-18",
    },
    {
      name: "Rudra Pratap",
      id: "1003",
      cardNumber: "1234-5678-9103",
      balance: "₱30,000.00",
      type: "Type 3",
      status: "active",
      lastActive: "2025-02-18",
    },
    {
      name: "Trisha Norton",
      id: "1004",
      cardNumber: "1234-5678-9104",
      balance: "₱30,000.00",
      type: "Type 1",
      status: "active",
      lastActive: "2025-02-18",
    },
    {
      name: "Jolene Orr",
      id: "1005",
      cardNumber: "1234-5678-9105",
      balance: "₱30,000.00",
      type: "Type 4",
      status: "inactive",
      lastActive: "2025-02-18",
    },
    {
      name: "Elvin Bond",
      id: "1006",
      cardNumber: "1234-5678-9106",
      balance: "₱0.00",
      type: "Type 1",
      status: "active",
      lastActive: "2025-02-18",
    },
  ];

  return (
    <div className="ecbarko">
      <main>
        <div className="head-title">
          <div className="left">
            <h1>EcBarko Card</h1>
            <ul className="breadcrumb">
              <li>
                <a href="#">Cards</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="card-table">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Card Number</th>
                <th>Balance</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <img src={profile} alt={account.name} />
                    {account.name}
                  </td>
                  <td>{account.cardNumber}</td>
                  <td>{account.balance}</td>
                  <td>{account.type}</td>
                  <td>
                    <span className={`status ${account.status}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>{account.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
