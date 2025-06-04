import '../../styles/Users.css'
import profile from '../../assets/imgs/profile.png'

const usersData = [
  {
    id: 1001,
    name: "Nisha Kumari",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 1",
    status: "active",
    lastActive: "2025-02-18",
  },
  {
    id: 1002,
    name: "Sophia",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 2",
    status: "deactivated",
    lastActive: "2025-02-18",
  },
  {
    id: 1003,
    name: "Rudra Pratap",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 3",
    status: "active",
    lastActive: "2025-02-18",
  },
  {
    id: 1004,
    name: "Trisha Norton",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 1",
    status: "active",
    lastActive: "2025-02-18",
  },
  {
    id: 1005,
    name: "Jolene Orr",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 4",
    status: "inactive",
    lastActive: "2025-02-18",
  },
  {
    id: 1006,
    name: "Elvin Bond",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 1",
    status: "active",
    lastActive: "2025-02-18",
  },
  {
    id: 1007,
    name: "Huzaifa Anas",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 2",
    status: "deactivated",
    lastActive: "2025-02-18",
  },
  {
    id: 1008,
    name: "Nisha Kumari",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 1",
    status: "active",
    lastActive: "2025-02-18",
  },
  {
    id: 1009,
    name: "Sophia",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 4",
    status: "inactive",
    lastActive: "2025-02-18",
  },
  {
    id: 1010,
    name: "Rudra Pratap",
    email: "example@email.com",
    phone: "09920000000",
    type: "Type 1",
    status: "active",
    lastActive: "2025-02-18",
  },
];

export default function Users() {
  return (
    <div className="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1>Accounts</h1>
            <ul className="breadcrumb">
              <li>
                <a href="#">Accounts</a>
              </li>
            </ul>
          </div>
          <a href="#" className="btn-download">
            <i className="bx bxs-cloud-download"></i>
            <span className="text">Download PDF</span>
          </a>
        </div>

        <div className="table-data">
          <div className="order">
            <div className="head">
              <h3>Accounts</h3>
              <i className="bx bx-search"></i>
              <i className="bx bx-filter"></i>
              <i className="bx bx-plus"></i>
              <i className="bx bx-pencil"></i>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Fullname</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Card Type</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <img src={profile} alt="Profile" />
                      <p>{user.name}</p>
                    </td>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.type}</td>
                    <td>
                      <span className={`status ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
