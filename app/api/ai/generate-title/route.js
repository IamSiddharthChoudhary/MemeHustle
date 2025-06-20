import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(req) {
  try {
    const { context, style } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Generate 5 catchy, viral-ready meme titles based on this context: "${
      context || "general meme"
    }"
    
    Style preference: ${style || "funny and relatable"}
    
    Requirements:
    - Make them internet culture aware
    - Use modern slang and meme language appropriately
    - Keep them under 60 characters
    - Make them shareable and engaging
    - Include popular formats like "POV:", "When...", "Me:", etc. when appropriate
    
    Return as a JSON array of strings:
    ["title1", "title2", "title3", "title4", "title5"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let titles;
    try {
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseError) {
      // Fallback titles
      titles = [
        "When the Algorithm Hits Just Right",
        "POV: You're Living Your Best Life",
        "This Hits Different Though",
        "Big Brain Energy Activated",
        "Me: *Exists* | Life:",
      ];
    }

    return NextResponse.json({ success: true, titles });
  } catch (error) {
    console.error("Error generating titles:", error);
    return NextResponse.json(
      { error: "Failed to generate titles" },
      { status: 500 }
    );
  }
}
