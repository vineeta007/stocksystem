const BORDER = '#1e1e16';
const TEXT   = '#d8d4c8';
const FAINT  = '#3a3830';

export default function ReportsPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '18px 24px 14px', borderBottom: `0.5px solid ${BORDER}` }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>Analytics</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>Reports</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: '#1e1e16', letterSpacing: '0.08em' }}>Reports</div>
        <div style={{ fontSize: 8, color: FAINT, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Coming Soon</div>
      </div>
    </div>
  );
}