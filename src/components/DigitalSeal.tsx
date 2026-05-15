import { ShieldCheck } from "lucide-react";

export default function DigitalSeal({ userName, date }: { userName: string, date: string }) {
  return (
    <div style={{ 
      border: '2px solid var(--success)', 
      borderRadius: '8px', 
      padding: '0.75rem', 
      display: 'inline-flex', 
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      transform: 'rotate(-5deg)',
      marginTop: '1rem',
      maxWidth: '220px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
        <ShieldCheck size={24} />
        <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>OFFICIALLY APPROVED</span>
      </div>
      <div style={{ marginTop: '0.5rem', textAlign: 'center', borderTop: '1px solid var(--success)', paddingTop: '0.5rem', width: '100%' }}>
        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600 }}>By: {userName.toUpperCase()}</p>
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(date).toLocaleString()}</p>
      </div>
    </div>
  );
}
