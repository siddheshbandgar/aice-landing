"use client";

import { useEffect, useRef, useState } from "react";

interface GradientBlindsProps {
  gradientColors?: string[];
  angle?: number;
  noise?: number;
  blindCount?: number;
  blindMinWidth?: number;
  spotlightRadius?: number;
  spotlightSoftness?: number;
  spotlightOpacity?: number;
  mouseDampening?: number;
  distortAmount?: number;
  shineDirection?: "left" | "right" | "center";
  mixBlendMode?: string;
}

export default function GradientBlinds({
  gradientColors = ["#640d5f", "#5227FF"],
  angle = 20,
  noise = 0,
  blindCount = 16,
  blindMinWidth = 60,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  mouseDampening = 0.15,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten",
}: GradientBlindsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [smoothMousePos, setSmoothMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      setSmoothMousePos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * mouseDampening,
        y: prev.y + (mousePos.y - prev.y) * mouseDampening,
      }));
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [mousePos, mouseDampening]);

  const blinds = Array.from({ length: blindCount }, (_, i) => {
    const progress = i / (blindCount - 1);
    const distortion = Math.sin(progress * Math.PI) * distortAmount;
    const width = `${100 / blindCount}%`;
    
    // Calculate distance from mouse for spotlight effect
    const blindCenterX = (i + 0.5) / blindCount;
    const dx = blindCenterX - smoothMousePos.x;
    const dy = 0.5 - smoothMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Spotlight intensity based on distance
    const spotlightIntensity = Math.max(
      0,
      1 - distance / (spotlightRadius * spotlightSoftness)
    );
    
    const baseOpacity = 0.3 + spotlightIntensity * spotlightOpacity * 0.7;

    // Determine gradient direction based on shineDirection
    let gradientAngle = angle;
    if (shineDirection === "left") {
      gradientAngle = angle + progress * 10;
    } else if (shineDirection === "right") {
      gradientAngle = angle - progress * 10;
    }

    return (
      <div
        key={i}
        className="h-full"
        style={{
          width,
          opacity: baseOpacity,
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors.join(", ")})`,
          transform: `translateY(${distortion}px)`,
          transition: "opacity 0.3s ease-out",
          mixBlendMode: mixBlendMode as any,
        }}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex pointer-events-none"
      style={{
        filter: noise > 0 ? `url(#noise)` : undefined,
      }}
    >
      {blinds}
      {noise > 0 && (
        <svg className="absolute w-0 h-0">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={noise}
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </svg>
      )}
    </div>
  );
}

