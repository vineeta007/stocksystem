'use client';

const COLORS = {
  green: { accent: '#22C55E', dot: '#22C55E' },
  amber: { accent: '#F59E0B', dot: '#F59E0B' },
  red: { accent: '#EF4444', dot: '#EF4444' },
  teal: { accent: '#06B6D4', dot: '#06B6D4' },
};

export default function StatCard({
  label,
  value,
  sub,
  color = 'teal',
}) {
  const { accent, dot } = COLORS[color] || COLORS.teal;

  return (
    <div
      style={{
        background: '#152847',
        border: '1px solid #1E3A5F',
        borderRadius: '14px',
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        minHeight: '130px',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Top Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: accent,
        }}
      />

      {/* Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginTop: '4px',
          marginBottom: '12px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#334155',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dot,
            flexShrink: 0,
          }}
        />

        {label}
      </div>

      {/* Main Value */}
      <div
        style={{
          fontSize: '38px',
          fontWeight: 700,
          color: '#000000',
          letterSpacing: '-1.5px',
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {sub && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            color: '#475569',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}