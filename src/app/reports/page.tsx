export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase-admin";
import AppLayout from "@/components/AppLayout";
import { BarChart3, Download, PieChart, TrendingUp, Inbox, Send, FileText } from "lucide-react";

export default async function ReportsPage() {
  if (!db) return <AppLayout title="System Reports & Analytics"><div>Firestore not initialized</div></AppLayout>;

  // Aggregate data
  const [incomingSnap, outgoingSnap, internalSnap, allLettersSnap, deptSnap] = await Promise.all([
    db.collection('letters').where('type', '==', 'Incoming').count().get(),
    db.collection('letters').where('type', '==', 'Outgoing').count().get(),
    db.collection('letters').where('type', '==', 'Internal').count().get(),
    db.collection('letters').select('status', 'priority', 'departmentId').get(),
    db.collection('departments').get()
  ]);

  const totalIncoming = incomingSnap.data().count;
  const totalOutgoing = outgoingSnap.data().count;
  const totalInternal = internalSnap.data().count;

  const statusMap: Record<string, number> = {};
  const priorityMap: Record<string, number> = {};
  const deptMap: Record<string, number> = {};

  allLettersSnap.docs.forEach((doc: any) => {
    const data = doc.data();
    if (data.status) statusMap[data.status] = (statusMap[data.status] || 0) + 1;
    if (data.priority) priorityMap[data.priority] = (priorityMap[data.priority] || 0) + 1;
    if (data.departmentId) deptMap[data.departmentId] = (deptMap[data.departmentId] || 0) + 1;
  });

  const statusCounts = Object.keys(statusMap).map(status => ({ status, _count: statusMap[status] }));
  const priorityCounts = Object.keys(priorityMap).map(priority => ({ priority, _count: priorityMap[priority] }));

  const departments = deptSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  
  const deptData = Object.keys(deptMap).map(id => ({
    name: departments.find((dept: any) => dept.id === id)?.name || "Unknown",
    count: deptMap[id]
  }));

  const totalLetters = totalIncoming + totalOutgoing + totalInternal;

  return (
    <AppLayout title="System Reports & Analytics">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <a href="/api/reports/export" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Export All Data (CSV)
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* KPI Cards */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Volume</p>
              <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{totalLetters}</h2>
            </div>
            <div style={{ color: 'var(--primary-blue)', opacity: 0.2 }}><TrendingUp size={48} /></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', fontWeight: 600 }}>Active Letters</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pending Review</p>
              <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
                {statusCounts.find(s => s.status === 'Pending')?._count || 0}
              </h2>
            </div>
            <div style={{ color: '#F59E0B', opacity: 0.2 }}><Inbox size={48} /></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Requires action</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Completion Rate</p>
              <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
                {totalLetters > 0 ? Math.round(((statusCounts.find(s => s.status === 'Approved')?._count || 0) / totalLetters) * 100) : 0}%
              </h2>
            </div>
            <div style={{ color: 'var(--success)', opacity: 0.2 }}><PieChart size={48} /></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Approved documents</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Letter Type Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={20} /> Letter Type Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Incoming Letters</span>
                <span style={{ fontWeight: 600 }}>{totalIncoming}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${(totalIncoming / totalLetters) * 100}%`, height: '100%', backgroundColor: 'var(--primary-blue)' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Outgoing Letters</span>
                <span style={{ fontWeight: 600 }}>{totalOutgoing}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${(totalOutgoing / totalLetters) * 100}%`, height: '100%', backgroundColor: 'var(--success)' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Internal Memos</span>
                <span style={{ fontWeight: 600 }}>{totalInternal}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${(totalInternal / totalLetters) * 100}%`, height: '100%', backgroundColor: '#F59E0B' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Priority Breakdown</h3>
          <div style={{ display: 'flex', gap: '1rem', height: '200px', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
            {['High', 'Medium', 'Low'].map(p => {
              const count = priorityCounts.find(pc => pc.priority === p)?._count || 0;
              const height = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
              return (
                <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <div style={{ 
                    width: '40px', 
                    height: `${height}%`, 
                    minHeight: count > 0 ? '4px' : '0',
                    backgroundColor: p === 'High' ? '#EF4444' : p === 'Medium' ? '#F59E0B' : 'var(--success)', 
                    borderRadius: '4px 4px 0 0' 
                  }}></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p}</span>
                  <span style={{ fontSize: '0.875rem' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Activity Table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Departmental Activity</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Department Name</th>
                <th style={{ paddingBottom: '0.75rem' }}>Total Letters Handled</th>
                <th style={{ paddingBottom: '0.75rem' }}>Activity Level</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map(dept => (
                <tr key={dept.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{dept.name}</td>
                  <td style={{ padding: '1rem 0' }}>{dept.count}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-color)', borderRadius: '9999px' }}>
                        <div style={{ width: `${(dept.count / Math.max(...deptData.map(d => d.count))) * 100}%`, height: '100%', backgroundColor: 'var(--primary-blue)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {Math.round((dept.count / totalLetters) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AppLayout>
  );
}
