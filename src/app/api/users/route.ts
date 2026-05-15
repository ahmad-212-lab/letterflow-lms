import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });
    
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    const body = await request.json();
    console.log("Creating user:", body.email);

    const existingUser = await db.collection("users").where("email", "==", body.email).get();

    if (!existingUser.empty) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash("password123", 10);

    const newUserRef = db.collection("users").doc();
    const newUserData = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: { name: body.role || "User" },
      department: { name: body.department || "General" },
      status: body.status || "Active",
      createdAt: new Date().toISOString()
    };

    await newUserRef.set(newUserData);

    return NextResponse.json({ id: newUserRef.id, ...newUserData }, { status: 201 });
  } catch (error) {
    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "Failed to create user. Please check server logs." }, { status: 500 });
  }
}
