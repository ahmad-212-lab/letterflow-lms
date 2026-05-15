import { Mail } from "lucide-react";

export default function PrintHeader() {
  return (
    <div className="print-only" style={{ display: 'none', marginBottom: '2rem', borderBottom: '2px solid var(--primary-dark)', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Mail size={48} color="#1E3A8A" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1E3A8A' }}>LETTERFLOW LMS</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>Digital Correspondence Management System</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>OFFICIAL RECORD</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
