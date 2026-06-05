'use client';

const COLORS = {
  green:  { accent: '#1D9E75', dot: '#34D399', label: '#34D399' },
  orange: { accent: '#F59E0B', dot: '#FCD34D', label: '#FCD34D' },
  red:    { accent: '#EF4444', dot: '#FCA5A5', label: '#FCA5A5' },
  blue:   { accent: '#3B82F6', dot: '#93C5FD', label: '#93C5FD' },
  teal:   { accent: '#1D9E75', dot: '#34D399', label: '#34D399' },
};

export default function StatCard({ label, value, sublabel, dotColor = 'teal' }) {
  const { accent, dot, label: labelColor } = COLORS[dotColor] || COLORS.teal;

  return (
    <div style={{
      background: '#1E293B',
      border: '1px solid rgba(148,163,184,0.1)',
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
      transition: 'border-color 0.2s',
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
        color: '#F1F5F9', letterSpacing: '-1.5px', lineHeight: 1,
      }}>
        {value}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}