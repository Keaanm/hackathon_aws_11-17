import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { files } from "@/lib/db/schema";

const s3Client = new S3Client({
  region: "us-west-2", // Change to your bucket's region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const POST = auth(async function POST(req) {
  if (!req.auth?.user) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const userId = req.auth?.user?.id;
  if (!userId) {
    NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const { fileName, fileType } = await req.json();
  const uniqueKey = `${userId}/${crypto.randomUUID()}-${fileName}`;

  try {
    await db.insert(files).values({
      name: fileName,
      key: uniqueKey,
      uploadStatus: "PENDING" as const,
      userId: userId,
      url: `https://${process.env
        .NEXT_PUBLIC_AWS_BUCKET!}.s3.${"us-west-2"}.amazonaws.com/${uniqueKey}`,
      createAt: new Date(),
    });

    // Generate a pre-signed URL for PUT
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET!,
      Key: uniqueKey,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    console.log("Generated Pre-Signed URL:", signedUrl);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Failed to generate pre-signed URL",
    });
  }
});
