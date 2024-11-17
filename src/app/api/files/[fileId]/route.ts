import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const DELETE = auth(async function POST(req, { params }) {
  if (!req.auth?.user) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const userId = req.auth?.user?.id;
  if (!userId) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  if (!params?.fileId) {
    NextResponse.json({ message: "Not Id Provided" }, { status: 401 });
  }

  try {
    const [userFiles] = await db
      .delete(files)

      .where(
        and(eq(files.userId, userId!), eq(files.id, params!.fileId as string))
      )
      .returning();

    return NextResponse.json({ data: userFiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Failed to generate pre-signed URL",
    });
  }
});
