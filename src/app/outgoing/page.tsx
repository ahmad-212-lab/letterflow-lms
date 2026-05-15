import { Send } from "lucide-react";
export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase-admin";
import RegisterOutgoingModal from "@/components/RegisterOutgoingModal";
import AppLayout from "@/components/AppLayout";
import LetterActions from "@/components/LetterActions";

export default async function OutgoingLettersPage() {
  if (!db) return <AppLayout title="Outgoing Letters"><div>Firestore not initialized</div></AppLayout>;

  const snapshot = await db.collection('letters')
    .where('type', '==', 'Outgoing')
    .get();

  const letters = snapshot.docs
    .map((doc: any) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout title="Outgoing Letters">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <RegisterOutgoingModal />
      </div>

      <div className="card">
        {letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Send size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>No outgoing letters found</h3>
            <p>Click "Compose Outgoing Letter" to create a new document.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Dispatch No.</th>
                <th style={{ paddingBottom: '0.75rem' }}>Title</th>
                <th style={{ paddingBottom: '0.75rem' }}>Recipient</th>
                <th style={{ paddingBottom: '0.75rem' }}>Date Sent</th>
                <th style={{ paddingBottom: '0.75rem' }}>Status</th>
                <th style={{ paddingBottom: '0.75rem', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {letters.map(letter => (
                <tr key={letter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{letter.referenceNo}</td>
                  <td style={{ padding: '1rem 0' }}>{letter.title}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{letter.recipient}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{new Date(letter.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {letter.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <LetterActions letterId={letter.id} currentStatus={letter.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
