import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { logAction } from "@/lib/audit-logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // Incoming, Outgoing, Internal

  try {
    if (!db) return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });

    let query: any = db.collection("letters");
    if (type) {
      query = query.where("type", "==", type);
    }
    
    // Firestore ordering on a field with a where clause usually requires a composite index.
    // If it fails, we might just order in memory for simplicity.
    const snapshot = await query.get();
    const letters = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(letters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
  }
}

import { writeFile } from "fs/promises";
import path from "path";

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

    const formData = await request.formData();
    const referenceNo = formData.get("referenceNo") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const sender = formData.get("sender") as string;
    const recipient = formData.get("recipient") as string;
    const priority = formData.get("priority") as string;
    const file = formData.get("file") as File | null;

    console.log(`Creating ${type} letter: ${referenceNo}`);

    // Check for duplicate reference number
    const existingLetterQuery = await db.collection('letters').where('referenceNo', '==', referenceNo).limit(1).get();

    if (!existingLetterQuery.empty) {
      return NextResponse.json({ 
        error: `A document with Reference No. "${referenceNo}" already exists.` 
      }, { status: 400 });
    }

    let attachmentPath = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      attachmentPath = `/uploads/${filename}`;
    }
    
    // Use user's department or default
    const userDept = typeof user.department === 'object' ? user.department : { name: user.departmentName || "General" };
    const departmentId = userDept.id || user.departmentId || "default";

    const newLetterRef = db.collection('letters').doc();
    const newLetterData = {
      referenceNo,
      title,
      description,
      type,
      sender,
      recipient,
      departmentId: departmentId,
      department: userDept, // embedded
      status: "Pending",
      priority: priority || "Medium",
      attachment: attachmentPath,
      createdById: user.id,
      createdBy: { name: user.name || "Unknown" }, // embedded
      createdAt: new Date().toISOString()
    };

    await newLetterRef.set(newLetterData);

    await logAction(
      user.id, 
      user.name || "Unknown", 
      'CREATE_LETTER', 
      `Registered ${type} letter: ${title} (${referenceNo})`,
      newLetterRef.id
    );

    return NextResponse.json({ id: newLetterRef.id, ...newLetterData }, { status: 201 });
  } catch (error) {
    console.error("Letter Creation Error:", error);
    return NextResponse.json({ error: "Failed to create letter. Please check for duplicate reference numbers." }, { status: 500 });
  }
}
