"use client";

import { Mail, LayoutDashboard, Inbox, Send, Users, Settings, FileText, Bell, BarChart3, History } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ChatPanel from "./ChatPanel";

export default function AppLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(console.error);
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Mail size={28} />
          <span>LetterFlow</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="/incoming" className={`nav-item ${pathname === "/incoming" ? "active" : ""}`}>
            <Inbox size={20} />
            <span>Incoming Letters</span>
          </a>
          <a href="/outgoing" className={`nav-item ${pathname === "/outgoing" ? "active" : ""}`}>
            <Send size={20} />
            <span>Outgoing Letters</span>
          </a>
          <a href="/internal" className={`nav-item ${pathname === "/internal" ? "active" : ""}`}>
            <FileText size={20} />
            <span>Internal Letters</span>
          </a>
          <a href="/users" className={`nav-item ${pathname === "/users" ? "active" : ""}`}>
            <Users size={20} />
            <span>Users & Roles</span>
          </a>
          <a href="/reports" className={`nav-item ${pathname === "/reports" ? "active" : ""}`}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </a>
          <a href="/logs" className={`nav-item ${pathname === "/logs" ? "active" : ""}`}>
            <History size={20} />
            <span>Audit Logs</span>
          </a>
          <a href="/settings" className={`nav-item ${pathname === "/settings" ? "active" : ""}`}>
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
            
            {/* Global Search Bar */}
            <form action="/search" method="GET" style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                name="q"
                placeholder="Search letters, memos, or refs..." 
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '9999px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}
              />
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </form>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: 'var(--text-muted)' }}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#EF4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="card" style={{ position: 'absolute', top: '100%', right: 0, width: '300px', marginTop: '0.5rem', padding: '0', zIndex: 50, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Notifications</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{n.title}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{session?.user?.name || 'Loading...'}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content animate-fade-in" key={title}>
          {children}
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
