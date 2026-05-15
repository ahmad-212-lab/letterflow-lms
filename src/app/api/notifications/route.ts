import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const userQuery = await db.collection('users').where('email', '==', session.user.email).limit(1).get();
    if (userQuery.empty) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userDoc = userQuery.docs[0];

    const notifsSnap = await db.collection('notifications')
      .where('userId', '==', userDoc.id)
      .limit(10)
      .get();
      
    const notifications = notifsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
