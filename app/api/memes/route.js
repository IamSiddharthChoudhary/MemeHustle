import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGO;
const client = new MongoClient(uri);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");

    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: filter },
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
      { $sort: { [sortBy]: order } },
      { $skip: skip },
      { $limit: limit },
    ];

    const result = await memes.aggregate(pipeline).toArray();
    const total = await memes.countDocuments(filter);

    return NextResponse.json({
      memes: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch memes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const tags = JSON.parse(formData.get("tags") || "[]");
    const creator = formData.get("creator");
    const price = Number.parseInt(formData.get("price") || "0");
    const isForSale = formData.get("isForSale") === "true";
    const isExclusive = formData.get("isExclusive") === "true";
    const image = formData.get("image");

    if (!title || !description || !category || !creator) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Validate image
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB" },
        { status: 400 }
      );
    }

    const memePrice = Math.max(0, Math.floor(price || 0));
    if (memePrice > 1000) {
      return NextResponse.json(
        { error: "Maximum price is 1000 coins" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("meme-marketplace");
    const memes = db.collection("memes");
    const users = db.collection("users");

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const imageUrl = `data:${image.type};base64,${base64Image}`;

    const memeDoc = {
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      imageName: image.name,
      imageSize: image.size,
      imageType: image.type,
      category,
      tags: tags || [],
      creator: new ObjectId(creator),
      price: memePrice,
      likes: [],
      views: 0,
      downloads: 0,
      isForSale,
      isFeatured: false,
      isExclusive,
      currentOwner: isExclusive ? new ObjectId(creator) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await memes.insertOne(memeDoc);

    await users.updateOne(
      { _id: new ObjectId(creator) },
      {
        $inc: { coins: 5, totalEarned: 5 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Meme uploaded successfully! You earned 5 bonus coins for posting!",
        memeId: result.insertedId,
        bonusCoins: 5,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create meme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
