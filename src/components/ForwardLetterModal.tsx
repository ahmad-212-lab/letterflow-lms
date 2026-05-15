"use client";

import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  department: { name: string } | null;
}

interface Department {
  id: number;
  name: string;
}

export default function ForwardLetterModal({ letterId, onComplete }: { letterId: number, onComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    receiverId: "",
    comment: "",
    isForApproval: false,
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch users and departments for forwarding
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(console.error);
        
      fetch("/api/departments")
        .then(res => res.json())
        .then(data => setDepartments(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiverId) return alert("Please select a recipient");
    
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: formData.isForApproval ? "RequestApproval" : "Forward", 
          receiverId: parseInt(formData.receiverId),
          comment: formData.comment 
        })
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
        if (onComplete) onComplete();
      } else {
        alert("Failed to forward letter");
      }
    } catch (error) {
      console.error(error);
      alert("Error forwarding letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
      >
        <Send size={16} /> Forward
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem' }}>Forward Letter</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Select Recipient</label>
                <select 
                  required 
                  value={formData.receiverId} 
                  onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                >
                  <option value="">-- Choose User --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department?.name || "No Dept"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Instruction / Comment</label>
                <textarea 
                  required
                  placeholder="Enter instructions for the recipient..."
                  value={formData.comment} 
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4} 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isForApproval" 
                  checked={formData.isForApproval}
                  onChange={(e) => setFormData({ ...formData, isForApproval: e.target.checked })}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <label htmlFor="isForApproval" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  Forward for Approval
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Forwarding...' : 'Forward Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
