import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },
      {
        $addFields: {
          creatorInfo: { $arrayElemAt: ["$creatorInfo", 0] },
          likesCount: { $size: "$likes" },
        },
      },
      {
        $project: {
          "creatorInfo.password": 0,
          "creatorInfo.email": 0,
        },
      },
    ];

    const meme = await memes.aggregate(pipeline).toArray();

    if (!meme || meme.length === 0) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    // Increment view count
    await memes.updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });

    return NextResponse.json({ meme: meme[0] });
  } catch (error) {
    console.error("Fetch meme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// PUT - Update meme
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const result = await memes.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Meme updated successfully" });
  } catch (error) {
    console.error("Update meme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE - Delete meme
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const result = await memes.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Meme deleted successfully" });
  } catch (error) {
    console.error("Delete meme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
