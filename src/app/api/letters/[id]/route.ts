import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const body = await request.json();
    const { action, comment } = body;

    const letterId = params.id;
    const letterRef = db.collection('letters').doc(letterId);
    const letterDoc = await letterRef.get();
    if (!letterDoc.exists) return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    const letter = letterDoc.data() as any;

    // Update letter status
    let newStatus = letter.status;
    let assignedToId = letter.assignedToId;
    
    if (action === "Approve") {
      newStatus = "Approved";
      assignedToId = null; // No longer assigned once approved
    } else if (action === "Reject") {
      newStatus = "Rejected";
      assignedToId = null;
    } else if (action === "Process") {
      newStatus = "Processing";
    } else if (action === "Forward") {
      newStatus = "Processing";
      assignedToId = body.receiverId;
    } else if (action === "RequestApproval") {
      newStatus = "Pending";
      assignedToId = body.receiverId;
    }

    const batch = db.batch();

    const updateData = { 
      status: newStatus, 
      approvedById: action === "Approve" ? user.id : null,
      assignedToId: assignedToId || null,
      currentApproverId: action === "RequestApproval" ? body.receiverId : (action === "Approve" || action === "Reject" ? null : letter.currentApproverId || null)
    };

    batch.update(letterRef, updateData);

    const workflowRef = db.collection('workflows').doc();
    batch.set(workflowRef, {
      letterId: letterId,
      senderId: user.id,
      sender: { name: user.name || "Unknown" },
      receiverId: (action === "Forward" || action === "RequestApproval") ? body.receiverId : user.id,
      action: action === "RequestApproval" ? "Forward for Approval" : action,
      comment: comment || "",
      status: newStatus,
      createdAt: new Date().toISOString()
    });

    if ((action === "Forward" || action === "RequestApproval") && body.receiverId) {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: body.receiverId,
        title: action === "RequestApproval" ? "Approval Requested" : "New Letter Assigned",
        message: action === "RequestApproval" ? `Letter ${letter.referenceNo} requires your approval. Requested by ${user.name}.` : `Letter ${letter.referenceNo} has been forwarded to you by ${user.name}.`,
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }

    if (letter.createdById !== user.id) {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: letter.createdById,
        title: `Letter ${newStatus}`,
        message: `Your letter ${letter.referenceNo} has been ${newStatus.toLowerCase()} by ${user.name}.`,
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }

    await batch.commit();

    return NextResponse.json({ id: letterId, ...letter, ...updateData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update letter" }, { status: 500 });
  }
}
