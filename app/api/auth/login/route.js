import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const uri = process.env.NEXT_PUBLIC_MONGO;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    await client.connect();
    const db = client.db("meme-marketplace");
    const users = db.collection("users");

    const user = await users.findOne({ email: email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const res = NextResponse.json({ message: "Login successful", user: user });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    console.log(res);
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}
