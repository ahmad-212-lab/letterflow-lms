import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const userQuery = await db.collection('users').where('email', '==', session.user.email).limit(1).get();
    if (userQuery.empty) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('users').doc(user.id).update({ password: hashedPassword });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
