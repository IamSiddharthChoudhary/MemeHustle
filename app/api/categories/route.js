import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const pipeline = [
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    const categories = await memes.aggregate(pipeline).toArray();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
