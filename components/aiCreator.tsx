"use client";
import { useState } from "react";

export default function AiCreator() {
  const [aiRes, setAiResponse] = useState<string>("");
  const [reqTxt, setReqTxt] = useState<string>("");

  async function apiCall() {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: reqTxt }),
    });

    const data = await res.text();
    setAiResponse(data);
    console.log(data);
  }

  return (
    <div className="h-screen w-full">
      <input
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setReqTxt(e.target.value)
        }
      />
      <button onClick={apiCall}>Click</button>
    </div>
  );
}
