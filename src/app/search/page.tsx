import { Search, FileText, Filter, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase-admin";

export default async function SearchResultsPage({ searchParams }: { searchParams: { q?: string, type?: string, status?: string, priority?: string, start?: string, end?: string } }) {
  const query = searchParams.q || "";
  const { type, status, priority, start, end } = searchParams;

  if (!db) return <AppLayout title="Advanced Search"><div>Firestore not initialized</div></AppLayout>;

  let results: any[] = [];

  if (query || type || status || priority || start || end) {
    let firestoreQuery: any = db.collection('letters');
    
    if (type && type !== "All") firestoreQuery = firestoreQuery.where("type", "==", type);
    if (status && status !== "All") firestoreQuery = firestoreQuery.where("status", "==", status);
    if (priority && priority !== "All") firestoreQuery = firestoreQuery.where("priority", "==", priority);
    
    const snapshot = await firestoreQuery.get();
    let allLetters = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Memory filter for text search and dates
    if (query || start || end) {
      const qLower = query.toLowerCase();
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;

      allLetters = allLetters.filter((letter: any) => {
        let match = true;
        if (query) {
          const textMatch = 
            (letter.referenceNo && letter.referenceNo.toLowerCase().includes(qLower)) ||
            (letter.title && letter.title.toLowerCase().includes(qLower)) ||
            (letter.sender && letter.sender.toLowerCase().includes(qLower)) ||
            (letter.recipient && letter.recipient.toLowerCase().includes(qLower)) ||
            (letter.description && letter.description.toLowerCase().includes(qLower));
          if (!textMatch) match = false;
        }
        
        if (startDate || endDate) {
          const letterDate = new Date(letter.createdAt);
          if (startDate && letterDate < startDate) match = false;
          if (endDate && letterDate > endDate) match = false;
        }
        
        return match;
      });
    }
    
    results = allLetters;
  }

  return (
    <AppLayout title="Advanced Search">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Filters Sidebar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <Filter size={18} color="var(--primary-blue)" />
            <h3 style={{ fontSize: '1rem' }}>Search Filters</h3>
          </div>

          <form action="/search" method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="q" value={query} />
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Letter Type</label>
              <select name="type" defaultValue={type || "All"} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                <option value="All">All Types</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
                <option value="Internal">Internal</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current Status</label>
              <select name="status" defaultValue={status || "All"} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Priority Level</label>
              <select name="priority" defaultValue={priority || "All"} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date Range</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="date" name="start" defaultValue={start} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} />
                <input type="date" name="end" defaultValue={end} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
              <a href={`/search?q=${query}`} style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Clear Filters</a>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="card">
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <Search size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>No documents found</h3>
              <p style={{ marginTop: '0.5rem' }}>Try adjusting your keywords or filters to find what you're looking for.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Search Results</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Showing {results.length} documents</p>
                </div>
                {query && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '9999px', fontSize: '0.875rem' }}>
                    Keyword: <strong>{query}</strong>
                    <a href="/search" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><X size={14} /></a>
                  </div>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Reference No.</th>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Title</th>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Type</th>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Date</th>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Status</th>
                    <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(letter => (
                    <tr key={letter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="var(--primary-blue)" />
                          {letter.referenceNo}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0' }}>{letter.title}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px', color: 'var(--text-muted)' }}>{letter.type}</span>
                      </td>
                      <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(letter.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          backgroundColor: letter.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : letter.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : letter.status === 'Processing' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: letter.status === 'Approved' ? 'var(--success)' : letter.status === 'Rejected' ? '#EF4444' : letter.status === 'Processing' ? 'var(--primary-blue)' : '#F59E0B', 
                          padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {letter.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <a href={`/letters/${letter.id}`} style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
