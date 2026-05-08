import StatCard from "../components/StatCard";

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <div className="topbar">
        <div>
          <p className="overview">OVERVIEW</p>
          <h1 className="title">Dashboard</h1>
        </div>

        <div className="actions">
          <button className="stock-btn">↓ STOCK IN</button>
          <button className="stock-btn">↑ STOCK OUT</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL PRODUCTS" value="18" subtitle="Active Items" />
        <StatCard title="LOW STOCK" value="5" subtitle="Need Attention" />
        <StatCard title="OUT OF STOCK" value="2" subtitle="Depleted Items" />
        <StatCard title="TRANSACTIONS" value="47" subtitle="This Month" />
      </div>

      <div className="middle-grid">
        <div className="panel">
          <div className="panel-header">
            <span>CURRENT STOCK LEVELS</span>
            <span className="view">VIEW ALL →</span>
          </div>

          <div className="stock-item">
            <div>
              <h4>D-Shackle</h4>
              <p>Swift Parts</p>
            </div>

            <div className="stock-right">
              <span>42</span>
              <span className="badge green">IN STOCK</span>
            </div>
          </div>

          <div className="stock-item">
            <div>
              <h4>Modular E.300</h4>
              <p>Lifting</p>
            </div>

            <div className="stock-right">
              <span>3</span>
              <span className="badge orange">LOW STOCK</span>
            </div>
          </div>

          <div className="stock-item">
            <div>
              <h4>Solarcraft Coil</h4>
              <p>Chain Warranty</p>
            </div>

            <div className="stock-right">
              <span>0</span>
              <span className="badge red">OUT OF STOCK</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>RECENT TRANSACTIONS</span>
            <span className="view">VIEW ALL →</span>
          </div>

          <div className="transaction green-text">
            ● In: Swift H-Shok — +15
          </div>

          <div className="transaction red-text">
            ● Out: Modular E. stock in — -3
          </div>

          <div className="transaction green-text">
            ● In: D-Shackle — +20
          </div>

          <div className="transaction red-text">
            ● Out: Solarcraft Coil stock in — -8
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <span>STOCK BY CATEGORY</span>
          </div>

          <div className="category-row">
            <span>Swift Parts</span>
            <div className="line"></div>
            <span>0</span>
          </div>

          <div className="category-row">
            <span>Lifting</span>
            <div className="line"></div>
            <span>8</span>
          </div>

          <div className="category-row">
            <span>PPE / Health</span>
            <div className="line"></div>
            <span>20</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>LOW STOCK ALERTS</span>
            <span className="view">MANAGE</span>
          </div>

          <div className="alert-row">
            <span>Flexa Par 100</span>
            <button>ORDER</button>
          </div>

          <div className="alert-row">
            <span>Emergency Key</span>
            <button>ORDER</button>
          </div>

          <div className="alert-row">
            <span>Roller Valve</span>
            <button>ORDER</button>
          </div>
        </div>
      </div>
    </div>
  );
}