"use client";
import { useState } from "react";

export default function CreateMeme() {
  const [text, setText] = useState<string>("something");

  const apiCall = async () => {
    const res = await fetch("/api/createMeme/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ something: text }),
    });
    const body = await res.json();
    console.log(body);
  };
  return (
    <div className="h-screen w-full">
      <button onClick={apiCall}>Create</button>
    </div>
  );
}
