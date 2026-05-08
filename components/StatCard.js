export default function StatCard({ label, value, sublabel, dotColor }) {
  const dotColors = {
    green: '#4caf7a',
    orange: '#d97b3a',
    red: '#e05050',
    blue: '#5b9bd5',
  };

  return (
    <div style={{
      background: '#1e1d19',
      border: '1px solid #2a2925',
      borderRadius: '6px',
      padding: '14px 16px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
      }}>
        <span style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#5a5850',
        }}>{label}</span>
        {dotColor && (
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: dotColors[dotColor] || dotColor,
            display: 'inline-block',
          }} />
        )}
      </div>
      <div style={{
        fontSize: '32px',
        fontFamily: 'Space Mono, monospace',
        fontWeight: 700,
        color: '#e8e4d9',
        lineHeight: 1,
        marginBottom: '4px',
      }}>{value}</div>
      {sublabel && (
        <div style={{ fontSize: '10px', color: '#5a5850' }}>{sublabel}</div>
      )}
    </div>
  );
}