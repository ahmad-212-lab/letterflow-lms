"use client";

import { Save, Shield, Database, Bell, Key, UserCheck, Lock, Mail, User, Settings } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "general" && !healthData) {
      fetch("/api/system/health").then(res => res.json()).then(setHealthData).catch(console.error);
    }
  }, [activeTab, healthData]);

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || ""
      });
    }
  }, [session]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        await update(profileData); // Update session with new data
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Account & System Settings">
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Settings Navigation Sidebar */}
        <div className="card" style={{ width: '250px', flexShrink: 0, padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button 
                onClick={() => setActiveTab("profile")}
                style={{ width: '100%', border: 'none', background: activeTab === 'profile' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              >
                <User size={18} /> My Profile
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("security")}
                style={{ width: '100%', border: 'none', background: activeTab === 'security' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'security' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              >
                <Shield size={18} /> Security
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("general")}
                style={{ width: '100%', border: 'none', background: activeTab === 'general' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'general' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              >
                <Database size={18} /> System Config
              </button>
            </li>
          </ul>
        </div>

        {/* Settings Form Content */}
        <div className="card" style={{ flex: 1 }}>
          
          {activeTab === "profile" && (
            <>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>My Profile</h3>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Save size={18} style={{ marginRight: '0.5rem' }}/> {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === "security" && (
            <>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Security & Password</h3>
              <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Current Password</label>
                  <input 
                    required 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                    <input 
                      required 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm New Password</label>
                    <input 
                      required 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} 
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Lock size={18} style={{ marginRight: '0.5rem' }}/> {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === "general" && (
            <>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>System Health Dashboard</h3>
              
              {!healthData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading system metrics...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</p>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{healthData.status}</h4>
                    </div>
                    <div className="card" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Uptime</p>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)' }}>{Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m</h4>
                    </div>
                    <div className="card" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Memory Usage</p>
                      <h4 style={{ fontSize: '1.25rem', color: '#F59E0B' }}>{Math.round(healthData.memoryUsage.heapUsed / 1024 / 1024)} MB</h4>
                    </div>
                  </div>

                  <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>Database Statistics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                        <span>Total Users</span>
                        <span style={{ fontWeight: 600 }}>{healthData.stats.totalUsers}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                        <span>Total Letters</span>
                        <span style={{ fontWeight: 600 }}>{healthData.stats.totalLetters}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                        <span>Pending Approvals</span>
                        <span style={{ fontWeight: 600, color: '#F59E0B' }}>{healthData.stats.pendingLetters}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </AppLayout>
  );
}
