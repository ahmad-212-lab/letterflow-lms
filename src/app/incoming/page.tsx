import { Inbox } from "lucide-react";
export const dynamic = 'force-dynamic';
import { db, initializationError } from "@/lib/firebase-admin";
import RegisterLetterModal from "@/components/RegisterLetterModal";
import AppLayout from "@/components/AppLayout";
import LetterActions from "@/components/LetterActions";

export default async function IncomingLettersPage() {
  if (!db) {
    return (
      <AppLayout title="Incoming Letters">
        <div style={{ padding: '2rem', color: 'red' }}>
          <h3>Database Connection Failed</h3>
          <p>Error: {initializationError || "Unknown connection issue"}</p>
          <p>Please check your Vercel Environment Variables.</p>
        </div>
      </AppLayout>
    );
  }

  const snapshot = await db.collection('letters')
    .where('type', '==', 'Incoming')
    .get();

  const letters = snapshot.docs
    .map((doc: any) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout title="Incoming Letters">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <RegisterLetterModal />
      </div>

      <div className="card">
        {letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Inbox size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>No incoming letters found</h3>
            <p>Click "Register Letter" to add a new document.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Ref No.</th>
                <th style={{ paddingBottom: '0.75rem' }}>Title</th>
                <th style={{ paddingBottom: '0.75rem' }}>Sender</th>
                <th style={{ paddingBottom: '0.75rem' }}>Date</th>
                <th style={{ paddingBottom: '0.75rem' }}>Status</th>
                <th style={{ paddingBottom: '0.75rem', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {letters.map(letter => (
                <tr key={letter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{letter.referenceNo}</td>
                  <td style={{ padding: '1rem 0' }}>{letter.title}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{letter.sender}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{new Date(letter.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
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
