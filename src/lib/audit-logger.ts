import { db } from "./firebase-admin";

export type AuditAction = 
  | 'LOGIN' 
  | 'CREATE_LETTER' 
  | 'UPDATE_LETTER' 
  | 'DELETE_LETTER' 
  | 'FORWARD_LETTER' 
  | 'UPDATE_USER' 
  | 'EXPORT_REPORT';

export async function logAction(
  userId: string, 
  userName: string, 
  action: AuditAction, 
  details: string,
  targetId?: string
) {
  if (!db) return;

  try {
    await db.collection('audit_logs').add({
      userId,
      userName,
      action,
      details,
      targetId: targetId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save audit log", error);
  }
}
