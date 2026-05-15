import { db } from "@/lib/firebase-admin";
import AppLayout from "@/components/AppLayout";
import { Search, FileText, User, Clock } from "lucide-react";

export default async function SearchResultsPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q?.toLowerCase() || "";
  if (!db) return <AppLayout title="Search Results"><div>Firestore not initialized</div></AppLayout>;

  // Firestore doesn't support full-text search natively without Algolia/ElasticSearch.
  // For this size, we fetch and filter in memory for perfect results.
  const lettersSnap = await db.collection('letters').get();
  
  const results = lettersSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(letter => 
      letter.title?.toLowerCase().includes(query) || 
      letter.referenceNo?.toLowerCase().includes(query) ||
      letter.sender?.toLowerCase().includes(query) ||
      letter.description?.toLowerCase().includes(query)
    );

  return (
    <AppLayout title={`Search: ${query}`}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Search size={24} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.25rem' }}>{results.length} results found for "{query}"</h3>
        </div>

        {results.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No documents or records match your search criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map(letter => (
              <a 
                key={letter.id} 
                href={`/letters/${letter.id}`} 
                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', borderRadius: '0.5rem' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-blue)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {letter.type}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{letter.referenceNo}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{letter.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>From: {letter.sender} • {new Date(letter.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                    {letter.status}
                   </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
