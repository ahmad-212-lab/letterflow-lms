"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterLetterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    referenceNo: "",
    title: "",
    sender: "",
    recipient: "General Administration",
    description: "",
    priority: "Medium"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("type", "Incoming");
      if (file) formDataToSend.append("file", file);

      const res = await fetch("/api/letters", {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({
          referenceNo: "", title: "", sender: "", recipient: "General Administration", description: "", priority: "Medium"
        });
        setFile(null);
        router.refresh();
      } else {
        alert("Failed to register letter");
      }
    } catch (error) {
      console.error(error);
      alert("Error registering letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={18} style={{ marginRight: '0.5rem' }}/> Register Letter
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem' }}>Register Incoming Letter</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Reference No.</label>
                  <input required name="referenceNo" value={formData.referenceNo} onChange={handleChange} type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Subject / Title</label>
                <input required name="title" value={formData.title} onChange={handleChange} type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Sender (From)</label>
                <input required name="sender" value={formData.sender} onChange={handleChange} type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', resize: 'none' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Attachment (Optional)</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  style={{ width: '100%', padding: '0.4rem', fontSize: '0.875rem' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
