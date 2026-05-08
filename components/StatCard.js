export default function Statcard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-label">{label}</div>

      <div className="dashboard-card-value">{value}</div>
    </div>
  );
}