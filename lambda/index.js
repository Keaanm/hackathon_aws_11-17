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

const db = drizzle(process.env.DATABASE_URL);

const s3 = new S3Client({ region: "us-west-2" });
const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

const foodItemsSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      calories: z.number().int().nonnegative(),
      protein: z.number().int().nonnegative(),
      carbs: z.number().int().nonnegative(),
      fat: z.number().int().nonnegative(),
    })
  ),
});

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

  const [userId, fileId, fileName] = objectKey.split("/");

  try {
    console.log("S3 Event:", JSON.stringify(event, null, 2));
    console.log("Extracted userId:", userId);
    console.log("Extracted fileId:", fileId);
    console.log("Extracted fileName:", fileName);

    const { Body: imageStream } = await s3.send(
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
    );
    const imageBase64 = base64.fromByteArray(await streamToBuffer(imageStream));

    const payload = {
      temperature: 0.1,
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      system: `Analyze the image and provide detailed nutritional information for each food item visible. Please provide an overestimate (upper bound estimate) of the nutritional values for each element of the dish.
      For each item, extract:
      - Name (be specific, e.g. "Grilled Chicken Breast" rather than just "Chicken")
      - Calories (whole numbers only)
      - Protein (in grams, whole numbers)
      - Carbohydrates (in grams, whole numbers)
      - Fat (in grams, whole numbers)

      Format your response as a JSON object with an "items" array. Each item should be an object with the properties: name, calories, protein, carbs, and fat.
      All numerical values must be non-negative integers.
      Do not include anything else in your response.

      Example response format:
      {
        "items": [
          {
            "name": "Grilled Chicken Breast",
            "calories": 165,
            "protein": 31,
            "carbs": 0,
            "fat": 3
          }
        ]
      }`,
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

    const textDecoder = new TextDecoder();
    const responseString = textDecoder.decode(bedrockResponse.body);

    console.log("Decoded Bedrock Response String:", responseString);

    const responseBody = JSON.parse(responseString);

    console.log("Parsed Bedrock Response Body:", responseBody);

    const rawText = responseBody.content[0].text.trim();

    if (!rawText.startsWith("{") || !rawText.endsWith("}")) {
      throw new Error("Invalid JSON format in Bedrock response");
    }

    const validatedData = foodItemsSchema.parse(JSON.parse(rawText));

    console.log("validated data: " + validatedData);

    console.log("Validated Food Data:", validatedData);

    for (const food of validatedData.items) {
      await db.insert(foodNutrition).values({
        fileId,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
      });
    }

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
    r;
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

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = { handler };
