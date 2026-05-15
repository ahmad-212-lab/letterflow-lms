import { Users } from "lucide-react";
export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase-admin";
import RegisterUserModal from "@/components/RegisterUserModal";
import AppLayout from "@/components/AppLayout";

export default async function UsersPage() {
  if (!db) return <AppLayout title="Users & Roles"><div>Firestore not initialized</div></AppLayout>;

  const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
  const users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  return (
    <AppLayout title="Users & Roles">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <RegisterUserModal />
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>No users found</h3>
            <p>Click "Add New User" to create an account.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Name</th>
                <th style={{ paddingBottom: '0.75rem' }}>Email</th>
                <th style={{ paddingBottom: '0.75rem' }}>Role</th>
                <th style={{ paddingBottom: '0.75rem' }}>Department</th>
                <th style={{ paddingBottom: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                      {user.role?.name || "User"}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.department?.name || "None"}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ backgroundColor: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.status === 'Active' ? 'var(--success)' : '#EF4444', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {user.status}
                    </span>
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
