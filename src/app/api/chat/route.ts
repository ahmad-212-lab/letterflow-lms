import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const snapshot = await db.collection("chatMessages")
      .orderBy("createdAt", "asc")
      .limit(50)
      .get();
      
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const userQuery = await db.collection('users').where('email', '==', session.user.email).limit(1).get();
    if (userQuery.empty) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;

    const { content } = await request.json();
    if (!content) return NextResponse.json({ error: "Message content is required" }, { status: 400 });

    const newMsgRef = db.collection('chatMessages').doc();
    const newMsgData = {
      content,
      userId: user.id,
      user: { name: user.name, email: user.email }, // embedded
      createdAt: new Date().toISOString()
    };
    
    await newMsgRef.set(newMsgData);

    return NextResponse.json({ id: newMsgRef.id, ...newMsgData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
