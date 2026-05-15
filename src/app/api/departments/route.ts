import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const snapshot = await db.collection("departments").orderBy("name", "asc").get();
    const departments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}
