import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(req) {
  try {
    const { template, topText, bottomText, style } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Create a meme concept using the "${template}" template with:
    Top text: "${topText}"
    Bottom text: "${bottomText}"
    Style: ${style || "funny"}

    Provide:
    1. An optimized version of the top and bottom text that's funnier and more viral
    2. A suggested title for this meme
    3. Relevant tags for discoverability
    4. A brief description of why this meme would be funny/relatable

    Format as JSON:
    {
      "optimizedTopText": "improved top text",
      "optimizedBottomText": "improved bottom text", 
      "title": "suggested title",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "description": "why this meme works"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let memeData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        memeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      memeData = {
        optimizedTopText: topText || "When you realize",
        optimizedBottomText: bottomText || "It really do be like that",
        title: "AI Generated Meme",
        tags: ["funny", "relatable", "meme", "viral", "generated"],
        description:
          "A perfectly crafted meme that captures the essence of modern internet humor.",
      };
    }

    return NextResponse.json({ success: true, memeData });
  } catch (error) {
    console.error("Error generating meme:", error);
    return NextResponse.json(
      { error: "Failed to generate meme" },
      { status: 500 }
    );
  }
}
