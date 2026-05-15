"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  id: number;
  content: string;
  user: { name: string; email: string };
  createdAt: string;
}

export default function ChatPanel() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            backgroundColor: 'var(--primary-blue)', color: 'white', 
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="card" style={{ 
          width: '350px', height: '500px', display: 'flex', flexDirection: 'column', 
          padding: 0, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-dark)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} />
              <span style={{ fontWeight: 600 }}>Staff Chat</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.875rem' }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user.email === session.user?.email;
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    {!isMe && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', marginLeft: '0.5rem' }}>{msg.user.name}</div>}
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                      backgroundColor: isMe ? 'var(--primary-blue)' : 'white',
                      color: isMe ? 'white' : 'var(--text-color)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      fontSize: '0.875rem',
                      border: isMe ? 'none' : '1px solid var(--border-color)'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}
            />
            <button 
              type="submit" 
              disabled={loading || !newMessage.trim()}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                backgroundColor: 'var(--primary-blue)', color: 'white', 
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
