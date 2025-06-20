import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this meme image and provide:
    1. 5 catchy, viral-ready titles that would work well for social media
    2. 10 relevant hashtags/tags for discoverability
    3. A compelling description that explains why this meme is funny or relatable
    4. The main meme category (Finance, Crypto, Classic, Rare, Emotion, Gaming, Sports, Politics, Animals, Technology, Food, Travel, Music, Art)

    Format your response as JSON:
    {
      "titles": ["title1", "title2", "title3", "title4", "title5"],
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      "description": "detailed description here",
      "category": "suggested category"
    }

    Make the titles punchy and internet-culture aware. Make tags lowercase without # symbol.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let aiSuggestions;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiSuggestions = {
        titles: [
          "When AI Can't Parse But Still Delivers",
          "This Meme Hits Different",
          "POV: You're Living Your Best Life",
          "Big Mood Energy Activated",
          "The Moment Everything Changed",
        ],
        tags: [
          "funny",
          "relatable",
          "mood",
          "viral",
          "meme",
          "quality",
          "premium",
          "trending",
          "epic",
          "based",
        ],
        description:
          "This image contains meme-worthy content that resonates with internet culture and has viral potential.",
        category: "Classic",
      };
    }

    return NextResponse.json({ success: true, suggestions: aiSuggestions });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image with AI" },
      { status: 500 }
    );
  }
}
