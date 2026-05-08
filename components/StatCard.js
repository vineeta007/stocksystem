export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p className="card-title">{title}</p>

      <h2>{value}</h2>

      <p className="card-subtitle">{subtitle}</p>
    </div>
  );
}