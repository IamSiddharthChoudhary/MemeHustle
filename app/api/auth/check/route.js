import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
