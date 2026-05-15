import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase-admin";
import os from "os";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const totalUsersSnap = await db.collection('users').count().get();
    const totalLettersSnap = await db.collection('letters').count().get();
    const pendingLettersSnap = await db.collection('letters').where('status', '==', 'Pending').count().get();
    
    const totalUsers = totalUsersSnap.data().count;
    const totalLetters = totalLettersSnap.data().count;
    const pendingLetters = pendingLettersSnap.data().count;
    
    return NextResponse.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      systemMemory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      stats: {
        totalUsers,
        totalLetters,
        pendingLetters
      },
      status: "Healthy"
    });
  } catch (error) {
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}
