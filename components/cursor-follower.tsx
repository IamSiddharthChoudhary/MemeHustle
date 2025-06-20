"use client";
import { useState, useEffect } from "react";

const emojis = ["😂", "🤣", "😆", "😄", "😁", "😊"];

export default function EnhancedCursorFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      setCurrentEmoji((prev) => (prev + 1) % emojis.length);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const followCursor = () => {
      setFollowerPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.8,
        y: prev.y + (mousePosition.y - prev.y) * 0.8,
      }));
    };

    const animationFrame = requestAnimationFrame(followCursor);
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePosition, followerPosition]);

  // Auto-rotate emoji every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % emojis.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed pointer-events-none z-[9999] transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
      }`}
      style={{
        left: followerPosition.x - 5,
        top: followerPosition.y - 5,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        {/* Main emoji with click effect */}
        <div
          className={`text-3xl select-none transition-transform duration-200 ${
            isClicking ? "animate-ping scale-125" : "animate-bounce-gentle"
          }`}
        >
          {emojis[currentEmoji]}
        </div>

        {/* Sparkle effects */}
        <div className="absolute -top-2 -right-2 text-xs animate-float-sparkle">
          ✨
        </div>
        <div className="absolute -bottom-2 -left-2 text-xs animate-pulse delay-500">
          💫
        </div>
        <div className="absolute -top-2 -left-2 text-xs animate-ping delay-700 opacity-60">
          ⭐
        </div>

        {/* Trailing effect */}
        <div
          className="absolute inset-0 text-3xl animate-pulse opacity-20 select-none blur-sm"
          style={{ animationDelay: "0.15s" }}
        >
          {emojis[currentEmoji]}
        </div>

        {/* Secondary trail */}
        <div
          className="absolute inset-0 text-2xl animate-pulse opacity-10 select-none blur-md"
          style={{ animationDelay: "0.3s" }}
        >
          {emojis[currentEmoji]}
        </div>
      </div>
    </div>
  );
}
