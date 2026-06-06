'use client';

const COLORS = {
  green:  { accent: '#16a34a', dot: '#16a34a', label: '#16a34a' },
  orange: { accent: '#d97706', dot: '#d97706', label: '#d97706' },
  red:    { accent: '#CC2020', dot: '#CC2020', label: '#CC2020' },
  blue:   { accent: '#3B82F6', dot: '#3B82F6', label: '#3B82F6' },
  teal:   { accent: '#1D9E75', dot: '#1D9E75', label: '#1D9E75' },
};

export default function StatCard({ label, value, sublabel, dotColor = 'teal' }) {
  const { accent, dot, label: labelColor } = COLORS[dotColor] || COLORS.teal;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      minHeight: '120px',
      fontFamily: "'Sora', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px', background: accent,
      }} />

      {/* Label */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '7px', marginBottom: '10px',
        fontSize: '10px', fontWeight: 600,
        color: labelColor, letterSpacing: '1px', textTransform: 'uppercase',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: dot, flexShrink: 0,
        }} />
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '48px', fontWeight: 700,
        color: '#111111', letterSpacing: '-1.5px', lineHeight: 1,
      }}>
        {value}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#888888' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}