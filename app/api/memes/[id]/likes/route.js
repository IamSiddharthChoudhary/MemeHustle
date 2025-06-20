import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGO;
const client = new MongoClient(uri);

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const meme = await memes.findOne({ _id: new ObjectId(id) });

    if (!meme) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    const isLiked = meme.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await memes.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likes: userId } }
      );
      return NextResponse.json({ message: "Meme unliked", liked: false });
    } else {
      // Like
      await memes.updateOne(
        { _id: new ObjectId(id) },
        { $push: { likes: userId } }
      );
      return NextResponse.json({ message: "Meme liked", liked: true });
    }
  } catch (error) {
    console.error("Like meme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
