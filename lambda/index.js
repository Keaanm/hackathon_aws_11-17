const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { z } = require("zod");
const { drizzle } = require("drizzle-orm/neon-http");
const { and, eq } = require("drizzle-orm");
const base64 = require("base64-js");
const {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} = require("drizzle-orm/pg-core");

// Database setup
const db = drizzle(process.env.DATABASE_URL);

// AWS Clients
const s3 = new S3Client({ region: "us-west-2" });
const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

// Schema Definitions
const foodItemSchema = z.object({
  name: z.string(),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
});

const foodItemsSchema = z.array(foodItemSchema);

const UploadEnum = pgEnum("uploadStatus", [
  "PENDING",
  "PROCESSING",
  "FAILED",
  "SUCCESS",
]);

const files = pgTable("file", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  uploadStatus: UploadEnum("uploadStatus").default("PENDING").notNull(),
  url: text("url").notNull(),
  key: text("key").notNull(),
  userId: uuid("userId").references(() => users.id),
  createAt: timestamp("createAt").notNull(),
  updatedAt: timestamp("updatedAt"),
});

const foodNutrition = pgTable("food_nutrition", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("fileId")
    .notNull()
    .references(() => files.id),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  fat: integer("fat").notNull(),
  carbs: integer("carbs").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

async function handler(event) {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  const [userId, fileNameWithId] = objectKey.split("/");
  const fileId = fileNameWithId.split("-")[0];

  try {
    console.log("S3 Event:", JSON.stringify(event, null, 2));
    console.log("Extracted userId:", userId);
    console.log("Extracted fileId:", fileId);

    const { Body: imageStream } = await s3.send(
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
    );
    const imageBase64 = base64.fromByteArray(await streamToBuffer(imageStream));

    const payload = {
      temperature: 0.1,
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      system: `Analyze the image and return the nutritional values of each item in JSON format.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const bedrockResponse = await bedrockClient.send(command);
    const responseBody = JSON.parse(bedrockResponse.body);

    const validatedData = foodItemsSchema.parse(
      JSON.parse(responseBody.content[0].text)
    );

    console.log("Validated Food Data:", validatedData);

    // Insert each food item into the database
    for (const food of validatedData.foodItems) {
      await db.insert(foodNutrition).values({
        fileId,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
      });
    }

    // Update file status to SUCCESS
    await db
      .update(files)
      .set({ uploadStatus: "SUCCESS" })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image processed successfully",
        data: validatedData.foodItems,
      }),
    };
  } catch (error) {
    console.error("Error processing image:", error);

    // Update file status to FAILED in case of an error
    await db
      .update(files)
      .set({ uploadStatus: "FAILED" })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to process image",
        error: error.message,
      }),
    };
  }
}

// Helper: Convert Readable Stream to Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = { handler };
