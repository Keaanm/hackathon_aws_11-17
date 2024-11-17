import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

//uploadFile.ts
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
  },
});

export const uploadFile = async ({
  fileName,
  file,
}: {
  fileName: string;
  file: File;
}) => {
  try {
    const sendRes = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
        Key: fileName,
        Body: file,
        ACL: "public-read",
      })
    );
    const meta = sendRes.$metadata;
    if (meta.httpStatusCode !== 200)
      throw new Error(
        `Error uploading file, with status: ${meta.httpStatusCode}`
      );

    return `https://your-website.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${fileName}`;
  } catch (err) {
    console.log(err);
  }
};
