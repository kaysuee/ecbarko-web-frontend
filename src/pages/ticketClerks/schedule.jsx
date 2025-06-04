import '../../styles/Schedules.css'

export default function Schedule() {
  return (
    <main>
      <div className="head-title">
        <div className="left">
          <h1>Schedule</h1>
          <ul className="breadcrumb">
            <li>
              <a href="#">Schedule</a>
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
                <th>Date</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>From</th>
                <th>To</th>
                <th>Shipping Lines</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: "2025-02-18",
                  departure: "1:00 AM",
                  arrival: "5:00 AM",
                  from: "Lucena",
                  to: "Marinduque",
                  shipping: "Starhorse",
                },
                {
                  date: "2025-02-18",
                  departure: "4:00 AM",
                  arrival: "9:00 AM",
                  from: "Lucena",
                  to: "Marinduque",
                  shipping: "Montenegro",
                },
                {
                  date: "2025-02-18",
                  departure: "6:00 AM",
                  arrival: "10:00 AM",
                  from: "Lucena",
                  to: "Marinduque",
                  shipping: "Starhorse",
                },
                {
                  date: "2025-02-18",
                  departure: "9:00 AM",
                  arrival: "1:00 PM",
                  from: "Lucena",
                  to: "Romblon",
                  shipping: "Starhorse",
                },
                {
                  date: "2025-02-18",
                  departure: "12:00 PM",
                  arrival: "4:00 PM",
                  from: "Lucena",
                  to: "Marinduque",
                  shipping: "Montenegro",
                },
              ].map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.departure}</td>
                  <td>{item.arrival}</td>
                  <td>{item.from}</td>
                  <td>{item.to}</td>
                  <td>{item.shipping}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
