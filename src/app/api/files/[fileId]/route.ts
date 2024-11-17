import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { files, foodNutrition } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const GET = auth(async function GET(req, { params }) {
  if (!req.auth?.user) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const userId = req.auth?.user?.id;
  if (!userId) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  if (!params?.fileId) {
    NextResponse.json({ message: "No Id Provided" }, { status: 401 });
  }

  try {
    const [userFile] = await db
      .select()
      .from(files)
      .where(
        and(eq(files.userId, userId!), eq(files.id, params!.fileId as string))
      );

    const foodNutritions = await db
      .select()
      .from(foodNutrition)
      .where(and(eq(foodNutrition.fileId, params!.fileId as string)));

    const data = {
      userFile,
      foodNutritions,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to generate pre-signed URL",
      },
      { status: 500 }
    );
  }
});

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
    return NextResponse.json(
      {
        error: "Failed to generate pre-signed URL",
      },
      { status: 500 }
    );
  }
});
