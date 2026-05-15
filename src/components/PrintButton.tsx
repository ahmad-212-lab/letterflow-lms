"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="btn btn-secondary"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: '1px solid var(--border-color)', background: 'white' }}
    >
      <Printer size={18} /> Print / Export PDF
    </button>
  );
}
