const DOT = { green: '#16a34a', orange: '#d97706', red: '#dc2626', blue: '#1d4ed8' };

export default function StatCard({ label, value, sublabel, dotColor = 'blue' }) {
  return (
    <div style={{
      flex: 1, background: '#fff',
      border: '1px solid #e2e6ed',
      borderRadius: '10px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: DOT[dotColor] || dotColor }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#8a96a8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: '30px', fontWeight: 700, color: '#0f1623', lineHeight: 1, marginBottom: '5px' }}>{value}</div>
      {sublabel && <div style={{ fontSize: '12px', color: '#8a96a8' }}>{sublabel}</div>}
    </div>
  );
}