import '../../styles/Vehicles.css'
import profile from '../../assets/imgs/profile.png'

export default function Vehicles() {
    return (
      <main className="vehicles">
        <div className="head-title">
          <div className="left">
            <h1>Vehicles</h1>
            <ul className="breadcrumb">
              <li>
                <a href="#">Vehicles</a>
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
                  <th>Card Holder</th>
                  <th>User ID</th>
                  <th>Linked RFID</th>
                  <th>Vehicle Type</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Nisha Kumari</p>
                  </td>
                  <td>1001</td>
                  <td>1234-5678-9101</td>
                  <td>SUV</td>
                  <td>Type 1</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Sophia</p>
                  </td>
                  <td>1002</td>
                  <td>1234-5678-9102</td>
                  <td>Motorcycle</td>
                  <td>Type 2</td>
                  <td>
                    <span className="status deactivated">deactivated</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Rudra Pratap</p>
                  </td>
                  <td>1003</td>
                  <td>1234-5678-9103</td>
                  <td>Truck</td>
                  <td>Type 3</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Trisha Norton</p>
                  </td>
                  <td>1004</td>
                  <td>1234-5678-9104</td>
                  <td>SUV</td>
                  <td>Type 1</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Jolene Orr</p>
                  </td>
                  <td>1005</td>
                  <td>1234-5678-9105</td>
                  <td>Motorcycle</td>
                  <td>Type 4</td>
                  <td>
                    <span className="status inactive">inactive</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Elvin Bond</p>
                  </td>
                  <td>1006</td>
                  <td>1234-5678-9106</td>
                  <td>Truck</td>
                  <td>Type 1</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Huzaifa Anas</p>
                  </td>
                  <td>1007</td>
                  <td>1234-5678-9107</td>
                  <td>SUV</td>
                  <td>Type 2</td>
                  <td>
                    <span className="status deactivated">deactivated</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Nisha Kumari</p>
                  </td>
                  <td>1008</td>
                  <td>1234-5678-9108</td>
                  <td>Motorcycle</td>
                  <td>Type 1</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Sophia</p>
                  </td>
                  <td>1009</td>
                  <td>1234-5678-9109</td>
                  <td>Truck</td>
                  <td>Type 4</td>
                  <td>
                    <span className="status inactive">inactive</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img src={profile} alt="Profile" />
                    <p>Rudra Pratap</p>
                  </td>
                  <td>1010</td>
                  <td>1234-5678-9110</td>
                  <td>Motorcycle</td>
                  <td>Type 1</td>
                  <td>
                    <span className="status active">active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }
  