import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGO;
const client = new MongoClient(uri);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "earned";
    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");

    const sortField = type === "balance" ? "coins" : "totalEarned";

    const leaderboard = await users
      .find(
        {},
        {
          projection: {
            password: 0,
            email: 0,
          },
        }
      )
      .sort({ [sortField]: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      leaderboard,
      type: type === "balance" ? "Current Coins" : "Total Earned",
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
