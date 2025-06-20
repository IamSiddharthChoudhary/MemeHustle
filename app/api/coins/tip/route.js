import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { fromUserId, toUserId, memeId, amount } = await req.json();

    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json(
        {
          error: "From user, to user, and amount are required",
        },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: "Cannot tip yourself" },
        { status: 400 }
      );
    }

    const tipAmount = Math.floor(amount);
    if (tipAmount < 1 || tipAmount > 100) {
      return NextResponse.json(
        {
          error: "Tip amount must be between 1 and 100 coins",
        },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");
    const transactions = db.collection("transactions");
    const memes = db.collection("memes");

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const [fromUser, toUser] = await Promise.all([
          users.findOne({ _id: new ObjectId(fromUserId) }),
          users.findOne({ _id: new ObjectId(toUserId) }),
        ]);

        if (!fromUser || !toUser) {
          throw new Error("User not found");
        }

        if (fromUser.coins < tipAmount) {
          throw new Error(
            `Insufficient coins. You need ${tipAmount} coins but only have ${fromUser.coins}`
          );
        }

        let memeTitle = "";
        if (memeId) {
          const meme = await memes.findOne({ _id: new ObjectId(memeId) });
          memeTitle = meme ? ` for "${meme.title}"` : "";
        }

        // Transfer coins
        await users.updateOne(
          { _id: new ObjectId(fromUserId) },
          {
            $inc: {
              coins: -tipAmount,
              totalSpent: tipAmount,
            },
          }
        );

        await users.updateOne(
          { _id: new ObjectId(toUserId) },
          {
            $inc: {
              coins: tipAmount,
              totalEarned: tipAmount,
            },
          }
        );

        // Record transaction
        await transactions.insertOne({
          buyer: fromUserId,
          seller: toUserId,
          meme: memeId || null,
          amount: tipAmount,
          type: "tip",
          status: "completed",
          description: `Tip${memeTitle}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      return NextResponse.json({
        message: `Successfully tipped ${tipAmount} coins!`,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Tip error:", error);
    return NextResponse.json(
      {
        error: error.message || "Tip failed",
      },
      { status: 400 }
    );
  } finally {
    await client.close();
  }
}
