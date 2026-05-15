"use client";

import { useState } from "react";
import { Check, X, Clock, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LetterActions({ letterId, currentStatus, showView = true }: { letterId: number, currentStatus: string, showView?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} this letter?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {showView && (
        <Link 
          href={`/letters/${letterId}`}
          title="View Details"
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Eye size={14} />
        </Link>
      )}

      {currentStatus !== "Approved" && currentStatus !== "Rejected" && (
        <>
          <button 
            onClick={() => handleAction("Approve")}
            disabled={loading}
            title="Approve"
            style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={14} strokeWidth={3} />
          </button>
          <button 
            onClick={() => handleAction("Reject")}
            disabled={loading}
            title="Reject"
            style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} strokeWidth={3} />
          </button>
          {currentStatus === "Draft" && (
            <button 
              onClick={() => handleAction("Process")}
              disabled={loading}
              title="Process"
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} strokeWidth={3} />
            </button>
          )}
        </>
      )}
      
      {(currentStatus === "Approved" || currentStatus === "Rejected") && !showView && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentStatus === "Approved" ? 'var(--success)' : '#EF4444' }}>
          {currentStatus}
        </span>
      )}
    </div>
  );
}
