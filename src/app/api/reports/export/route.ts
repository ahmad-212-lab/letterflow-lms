import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Export API: Session found?", !!session, session?.user?.email);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!db) return new NextResponse("Firestore not initialized", { status: 500 });

    const snapshot = await db.collection('letters').orderBy('createdAt', 'desc').get();
    const letters = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    console.log(`Export API: Found ${letters.length} letters to export.`);

    // CSV Header
    let csv = "ID,Reference No,Title,Type,Sender,Recipient,Department,Status,Priority,Created By,Created At\n";

    // CSV Rows
    letters.forEach(letter => {
      const row = [
        letter.id,
        `"${(letter.referenceNo || '').replace(/"/g, '""')}"`,
        `"${(letter.title || '').replace(/"/g, '""')}"`,
        letter.type || '',
        `"${(letter.sender || '').replace(/"/g, '""')}"`,
        `"${(letter.recipient || '').replace(/"/g, '""')}"`,
        `"${(letter.department?.name || 'N/A').replace(/"/g, '""')}"`,
        letter.status || '',
        letter.priority || '',
        `"${(letter.createdBy?.name || 'System').replace(/"/g, '""')}"`,
        letter.createdAt ? letter.createdAt : ''
      ].join(",");
      csv += row + "\n";
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=LetterFlow_Report_${new Date().toISOString().split('T')[0]}.csv`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
