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
  const [time, setTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Subtle autonomous animation - only runs after mount
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setTime((t) => t + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
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
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const animate = () => {
      setSmoothMousePos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * mouseDampening,
        y: prev.y + (mousePos.y - prev.y) * mouseDampening,
      }));
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [mousePos, mouseDampening, mounted]);

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
    
    // Add subtle wave animation (only after mount)
    const waveOffset = mounted ? Math.sin(time + i * 0.3) * 0.08 : 0;
    const baseOpacity = 0.25 + spotlightIntensity * spotlightOpacity * 0.75 + waveOffset;

    // Determine gradient direction based on shineDirection
    let gradientAngle = angle;
    if (shineDirection === "left") {
      gradientAngle = angle + progress * 15 + (mounted ? Math.sin(time * 0.5) * 3 : 0);
    } else if (shineDirection === "right") {
      gradientAngle = angle - progress * 15 - (mounted ? Math.sin(time * 0.5) * 3 : 0);
    }

    return (
      <div
        key={i}
        className="h-full"
        style={{
          width,
          opacity: Math.max(0.15, Math.min(1, baseOpacity)),
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors.join(", ")})`,
          transform: `translateY(${distortion}px)`,
          transition: "opacity 0.4s ease-out",
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
