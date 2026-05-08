const DOT_COLORS = {
  green:  '#4caf7a',
  orange: '#d97b3a',
  red:    '#e05050',
  blue:   '#5a8fd4',
};

export default function StatCard({ label, value, sublabel, dotColor = 'green' }) {
  const dot = DOT_COLORS[dotColor] || dotColor;

  return (
    <div style={{
      flex: 1,
      background: '#1a1915',
      border: '0.5px solid #2a2925',
      borderRadius: '4px',
      padding: '14px 16px',
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px',
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%', background: dot, flexShrink: 0,
        }} />
        <div style={{
          fontSize: '8px', color: '#5a5850', letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>{label}</div>
      </div>
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '26px', fontWeight: 700,
        color: '#e8e4d9', lineHeight: 1, marginBottom: '4px',
      }}>{value}</div>
      {sublabel && (
        <div style={{ fontSize: '9px', color: '#3a3830', letterSpacing: '0.05em' }}>{sublabel}</div>
      )}
    </div>
  );
}