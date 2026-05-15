import { Inbox, Send, FileText } from "lucide-react";
import AppLayout from "@/components/AppLayout";
export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase-admin";

export default async function Home() {
  if (!db) return <AppLayout title="Dashboard"><div>Firestore not initialized</div></AppLayout>;

  const [incomingSnap, outgoingSnap, pendingSnap, recentSnap, deptSnap, allLettersSnap] = await Promise.all([
    db.collection('letters').where('type', '==', 'Incoming').count().get(),
    db.collection('letters').where('type', '==', 'Outgoing').count().get(),
    db.collection('letters').where('status', '==', 'Pending').count().get(),
    db.collection('letters').orderBy('createdAt', 'desc').limit(5).get(),
    db.collection('departments').get(),
    db.collection('letters').select('departmentId').get()
  ]);

  const incomingCount = incomingSnap.data().count;
  const outgoingCount = outgoingSnap.data().count;
  const pendingCount = pendingSnap.data().count;
  
  const recentLetters = recentSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  const departments = deptSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  const deptCountsMap: Record<string, number> = {};
  allLettersSnap.docs.forEach((doc: any) => {
    const dId = doc.data().departmentId;
    if (dId) deptCountsMap[dId] = (deptCountsMap[dId] || 0) + 1;
  });
  const deptCounts = Object.keys(deptCountsMap).map(id => ({ departmentId: id, _count: deptCountsMap[id] }));

  const deptData = deptCounts.map(d => ({
    name: departments.find(dept => dept.id === d.departmentId)?.name || "General",
    count: d._count
  })).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...deptData.map(d => d.count), 1);

  return (
    <AppLayout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* ... (existing cards) ... */}
        
        {/* Stat Cards */}
        <div className="card animate-fade-in delay-100" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', borderRadius: '0.5rem' }}>
            <Inbox size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Incoming</p>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{incomingCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card animate-fade-in delay-200" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem' }}>
            <Send size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Outgoing</p>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{outgoingCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card animate-fade-in delay-300" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderRadius: '0.5rem' }}>
            <FileText size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Pending Approvals</p>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{pendingCount.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="card animate-fade-in delay-400">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Recent Letters</h3>
          {recentLetters.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No letters found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Ref. No</th>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Subject</th>
                  <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLetters.map((letter) => (
                  <tr key={letter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 500, fontSize: '0.875rem' }}>{letter.referenceNo}</td>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{letter.title}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span style={{ 
                        backgroundColor: letter.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        color: letter.status === 'Approved' ? 'var(--success)' : '#F59E0B', 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 
                      }}>
                        {letter.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Department Volume Chart */}
        <div className="card animate-fade-in delay-500">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Department Volume</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {deptData.map((dept) => (
              <div key={dept.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{dept.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{dept.count} letters</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(dept.count / maxCount) * 100}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--primary-blue)',
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
