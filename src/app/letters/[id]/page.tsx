import { db } from "@/lib/firebase-admin";
import AppLayout from "@/components/AppLayout";
import { notFound } from "next/navigation";
import { FileText, Calendar, User, Tag, Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import ForwardLetterModal from "@/components/ForwardLetterModal";
import PrintButton from "@/components/PrintButton";

import LetterActions from "@/components/LetterActions";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import PrintHeader from "@/components/PrintHeader";
import DigitalSeal from "@/components/DigitalSeal";

export default async function LetterDetailPage({ params }: { params: { id: string } }) {
  if (!db) return notFound();

  const letterDoc = await db.collection('letters').doc(params.id).get();
  if (!letterDoc.exists) notFound();
  
  const letterData = letterDoc.data() as any;
  
  // Resolve assignedTo manually
  let assignedTo = null;
  if (letterData.assignedToId) {
    const assignedDoc = await db.collection('users').doc(letterData.assignedToId).get();
    if (assignedDoc.exists) assignedTo = { id: assignedDoc.id, ...assignedDoc.data() };
  }

  // Resolve workflows manually
  const workflowsSnap = await db.collection('workflows').where('letterId', '==', params.id).get();
  
  const workflowsRaw = workflowsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const workflows = await Promise.all(workflowsRaw.map(async (wf) => {
    let receiver = { name: "Unknown" };
    if (wf.receiverId) {
      const recDoc = await db!.collection('users').doc(wf.receiverId).get();
      if (recDoc.exists) receiver = recDoc.data() as any;
    }
    return {
      ...wf,
      sender: wf.sender || { name: "Unknown" },
      receiver
    };
  }));

  const letter = {
    id: letterDoc.id,
    ...letterData,
    assignedTo,
    createdBy: letterData.createdBy || { name: "Unknown" }, // embedded
    department: letterData.department || { name: "General" }, // embedded
    workflows
  };
  return (
    <AppLayout title={`Letter Details: ${letter.referenceNo}`}>
      <PrintHeader />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Letter Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <span className="no-print" style={{ 
                  backgroundColor: letter.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : letter.priority === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: letter.priority === 'High' ? '#EF4444' : letter.priority === 'Medium' ? '#F59E0B' : 'var(--success)',
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', display: 'inline-block'
                }}>
                  {letter.priority} Priority
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color)' }}>{letter.title}</h1>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <span style={{ 
                  backgroundColor: letter.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : letter.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                  color: letter.status === 'Approved' ? 'var(--success)' : letter.status === 'Rejected' ? '#EF4444' : 'var(--primary-blue)', 
                  padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 
                }}>
                  {letter.status}
                </span>
                <QRCodeDisplay value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/letters/${letter.id}`} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--primary-blue)' }}><Calendar size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date Registered</p>
                  <p style={{ fontWeight: 600 }}>{new Date(letter.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--primary-blue)' }}><Tag size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Letter Type</p>
                  <p style={{ fontWeight: 600 }}>{letter.type}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--primary-blue)' }}><User size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sender / Origin</p>
                  <p style={{ fontWeight: 600 }}>{letter.sender}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--primary-blue)' }}><ArrowRight size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Recipient / Destination</p>
                  <p style={{ fontWeight: 600 }}>{letter.recipient}</p>
                </div>
              </div>
            </div>

            {letter.status === 'Approved' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginBottom: '1rem' }}>
                <DigitalSeal userName={letter.assignedTo?.name || letter.createdBy.name} date={letter.updatedAt || letter.createdAt} />
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Description</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-color)' }}>{letter.description}</p>
            </div>
            
            {letter.attachment && (
              <div className="no-print" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FileText size={24} color="var(--primary-blue)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Attachment</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{letter.attachment.split('/').pop()}</p>
                </div>
                <a href={letter.attachment} download className="btn btn-secondary" style={{ fontSize: '0.75rem', textDecoration: 'none', border: '1px solid var(--border-color)', background: 'white' }}>Download</a>
              </div>
            )}
          </div>

          <div className="card no-print">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Workflow Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {letter.workflows.map((wf: any, idx: number) => (
                <div key={wf.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {idx !== letter.workflows.length - 1 && (
                    <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: '-20px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>
                  )}
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    backgroundColor: wf.action === 'Approve' ? 'rgba(16, 185, 129, 0.1)' : wf.action === 'Reject' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: wf.action === 'Approve' ? 'var(--success)' : wf.action === 'Reject' ? '#EF4444' : 'var(--primary-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0
                  }}>
                    {wf.action === 'Approve' ? <CheckCircle size={18} /> : wf.action === 'Reject' ? <XCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <p style={{ fontWeight: 600 }}>{wf.action} by {wf.sender.name}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(wf.createdAt).toLocaleString()}</span>
                    </div>
                    {wf.receiverId !== wf.senderId && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Forwarded to: <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{wf.receiver.name}</span></p>
                    )}
                    {wf.comment && (
                      <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        "{wf.comment}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Current Status</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Currently With</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {letter.assignedTo ? letter.assignedTo.name.charAt(0).toUpperCase() : letter.createdBy.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600 }}>{letter.assignedTo?.name || letter.createdBy.name}</span>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Quick Actions</p>
              <LetterActions letterId={letter.id} currentStatus={letter.status} showView={false} />
              <ForwardLetterModal letterId={letter.id} />
              <div style={{ marginTop: '0.5rem' }}>
                <PrintButton />
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Need Help?</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5 }}>If you have questions about this letter or the workflow, please contact the IT support or the sender directly.</p>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
