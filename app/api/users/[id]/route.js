import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");
    const memes = db.collection("memes");

    const user = await users.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's memes
    const userMemes = await memes.find({ creator: id }).toArray();

    return NextResponse.json({
      user: {
        ...user,
        memesCount: userMemes.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();

    delete updates.password;
    delete updates.email;
    delete updates.coins;
    delete updates.totalEarned;
    delete updates.totalSpent;

    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
