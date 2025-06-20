import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");
    const transactions = db.collection("transactions");

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already claimed bonus today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBonus = await transactions.findOne({
      buyer: userId,
      type: "daily_bonus",
      createdAt: { $gte: today },
    });

    if (todayBonus) {
      return NextResponse.json(
        {
          error: "Daily bonus already claimed today. Come back tomorrow!",
        },
        { status: 400 }
      );
    }

    const bonusAmount = 10; // 10 coins daily bonus

    // Award bonus coins
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { coins: bonusAmount } }
    );

    // Record transaction
    await transactions.insertOne({
      buyer: userId,
      seller: "system",
      meme: null,
      amount: bonusAmount,
      type: "daily_bonus",
      status: "completed",
      description: "Daily login bonus",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: `Daily bonus claimed! You received ${bonusAmount} coins!`,
      bonusAmount,
      newBalance: user.coins + bonusAmount,
    });
  } catch (error) {
    console.error("Daily bonus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
