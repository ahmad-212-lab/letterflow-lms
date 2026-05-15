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

    const userQuery = await db.collection('users').where('email', '==', session.user.email).limit(1).get();
    if (userQuery.empty) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    console.log("Updating profile for:", session.user.email, "New data:", { name, email });

    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const userQuery = await db.collection('users').where('email', '==', session.user.email).limit(1).get();
    if (userQuery.empty) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userDoc = userQuery.docs[0];

    await db.collection('users').doc(userDoc.id).update({ name, email });
    const updatedUser = { id: userDoc.id, ...userDoc.data(), name, email };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
