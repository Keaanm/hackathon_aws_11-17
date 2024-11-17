import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const GET = auth(async function GET(req) {
  if (!req.auth?.user) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const userId = req.auth?.user?.id;
  if (!userId) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const userFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId!));

    return NextResponse.json(userFiles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Failed to generate pre-signed URL",
    });
  }
});
