import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGO;
const client = new MongoClient(uri);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const transactions = db.collection("transactions");

    const skip = (page - 1) * limit;
    const userObjectId = new ObjectId(userId);

    const pipeline = [
      {
        $match: {
          $or: [{ buyer: userObjectId }, { seller: userObjectId }],
        },
      },
      {
        $lookup: {
          from: "memes",
          localField: "meme",
          foreignField: "_id",
          as: "memeInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $addFields: {
          memeInfo: { $arrayElemAt: ["$memeInfo", 0] },
          buyerInfo: { $arrayElemAt: ["$buyerInfo", 0] },
          sellerInfo: { $arrayElemAt: ["$sellerInfo", 0] },
        },
      },
      {
        $project: {
          "buyerInfo.password": 0,
          "sellerInfo.password": 0,
          "buyerInfo.email": 0,
          "sellerInfo.email": 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const result = await transactions.aggregate(pipeline).toArray();
    const total = await transactions.countDocuments({
      $or: [{ buyer: userObjectId }, { seller: userObjectId }],
    });

    return NextResponse.json({
      transactions: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  let session;
  try {
    const { buyerId, memeId } = await req.json();

    if (!buyerId || !memeId) {
      return NextResponse.json(
        { error: "Buyer ID and Meme ID required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const transactions = db.collection("transactions");
    const memes = db.collection("memes");
    const users = db.collection("users");

    const buyerObjectId = new ObjectId(buyerId);
    const memeObjectId = new ObjectId(memeId);

    session = client.startSession();

    const result = await session.withTransaction(async () => {
      // Fetch meme and buyer with fresh data
      const meme = await memes.findOne({ _id: memeObjectId }, { session });
      const buyer = await users.findOne({ _id: buyerObjectId }, { session });

      if (!meme) {
        throw new Error("Meme not found");
      }

      if (!buyer) {
        throw new Error("Buyer not found");
      }

      if (!meme.isForSale) {
        throw new Error("This meme is not for sale");
      }

      if (buyer.coins < meme.price) {
        throw new Error(
          `Insufficient coins. You need ${meme.price} coins but only have ${buyer.coins}`
        );
      }

      const creatorObjectId = new ObjectId(meme.creator);
      if (creatorObjectId.equals(buyerObjectId)) {
        throw new Error("You cannot buy your own meme");
      }

      // Check if exclusive meme is already owned by someone else
      if (
        meme.isExclusive &&
        meme.currentOwner &&
        !new ObjectId(meme.currentOwner).equals(creatorObjectId)
      ) {
        throw new Error("This exclusive meme is already owned by someone else");
      }

      // Get seller info
      const seller = await users.findOne({ _id: creatorObjectId }, { session });
      if (!seller) {
        throw new Error("Seller not found");
      }

      // Create transaction record
      const transactionDoc = {
        buyer: buyerObjectId,
        seller: creatorObjectId,
        meme: memeObjectId,
        amount: meme.price,
        type: "purchase",
        status: "completed",
        description: `Purchased meme: ${meme.title}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await transactions.insertOne(transactionDoc, { session });

      // Update buyer: deduct coins and increase totalSpent
      const buyerUpdateResult = await users.updateOne(
        { _id: buyerObjectId },
        {
          $inc: {
            coins: -meme.price,
            totalSpent: meme.price,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { session }
      );

      // Update seller: add coins and increase totalEarned
      const sellerUpdateResult = await users.updateOne(
        { _id: creatorObjectId },
        {
          $inc: {
            coins: meme.price,
            totalEarned: meme.price,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { session }
      );

      // Update meme
      const memeUpdateData = {
        $inc: {
          downloads: 1,
        },
        $set: {
          updatedAt: new Date(),
        },
      };

      if (meme.isExclusive) {
        // For exclusive memes, transfer ownership and remove from sale
        memeUpdateData.$set.currentOwner = buyerObjectId;
        memeUpdateData.$set.isForSale = false;
      }

      const memeUpdateResult = await memes.updateOne(
        { _id: memeObjectId },
        memeUpdateData,
        { session }
      );

      // Verify all updates were successful
      if (buyerUpdateResult.modifiedCount === 0) {
        throw new Error("Failed to update buyer balance");
      }
      if (sellerUpdateResult.modifiedCount === 0) {
        throw new Error("Failed to update seller balance");
      }
      if (memeUpdateResult.modifiedCount === 0) {
        throw new Error("Failed to update meme");
      }

      // Get updated user data
      const updatedBuyer = await users.findOne(
        { _id: buyerObjectId },
        { session }
      );
      const updatedSeller = await users.findOne(
        { _id: creatorObjectId },
        { session }
      );
      const updatedMeme = await memes.findOne(
        { _id: memeObjectId },
        { session }
      );

      return {
        transaction: transactionDoc,
        buyer: {
          _id: updatedBuyer._id,
          coins: updatedBuyer.coins,
          totalSpent: updatedBuyer.totalSpent,
        },
        seller: {
          _id: updatedSeller._id,
          coins: updatedSeller.coins,
          totalEarned: updatedSeller.totalEarned,
        },
        meme: {
          _id: updatedMeme._id,
          isForSale: updatedMeme.isForSale,
          currentOwner: updatedMeme.currentOwner,
          downloads: updatedMeme.downloads,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully purchased "${result.meme.title || "meme"}" for ${
          result.transaction.amount
        } coins!`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Purchase failed",
      },
      { status: 400 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
    await client.close();
  }
}
