import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(req) {
  try {
    const { title, category, tags, currentDescription } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Create an engaging meme description based on:
    Title: "${title}"
    Category: "${category}"
    Tags: ${tags?.join(", ") || "none"}
    Current description: "${currentDescription || "none"}"

    Requirements:
    - Make it engaging and shareable
    - Explain why this meme is funny or relatable
    - Keep it under 200 characters
    - Use internet culture language appropriately
    - Make it appealing for social media sharing

    Return just the description text, no JSON formatting needed.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();

    return NextResponse.json({ success: true, description });
  } catch (error) {
    console.error("Error enhancing description:", error);
    return NextResponse.json(
      { error: "Failed to enhance description" },
      { status: 500 }
    );
  }
}
