import StatCard from '@/components/StatCard';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="card-grid">
        <StatCard label="Total Products" value={18} />
        <StatCard label="Low Stock Items" value={5} />
        <StatCard label="Out Of Stock" value={2} />
        <StatCard label="Transactions" value={47} />
      </div>

      <div className="section-grid">
        <div className="panel">
          <div className="panel-title">Current Stock Levels</div>

          <table className="table">
            <tbody>
              <tr>
                <td>Oil Seal</td>
                <td>
                  <span className="badge badge-good">Healthy</span>
                </td>
                <td>56</td>
              </tr>

              <tr>
                <td>Bearing</td>
                <td>
                  <span className="badge badge-low">Low</span>
                </td>
                <td>8</td>
              </tr>

              <tr>
                <td>Hydraulic Kit</td>
                <td>
                  <span className="badge badge-out">Out</span>
                </td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-title">Recent Transactions</div>

          <table className="table">
            <tbody>
              <tr>
                <td>Added Bearings</td>
                <td>+12</td>
              </tr>

              <tr>
                <td>Removed Oil Seal</td>
                <td>-4</td>
              </tr>

              <tr>
                <td>Added Bolts</td>
                <td>+20</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}