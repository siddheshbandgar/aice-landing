"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import GradientBlinds from "@/components/landing/gradient-blinds";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleJoinNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await setDoc(doc(db, "newsletter_subscribers", email), {
        email,
        subscribedAt: new Date().toISOString(),
        source: "landing_page",
      });
      setIsSubmitted(true);
      toast.success("Welcome to AICE! Check your inbox soon.");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#040a12] relative overflow-hidden">
      {/* Interactive gradient background - follows cursor */}
      <div className="absolute inset-0 w-full h-full z-10" aria-hidden="true">
        <GradientBlinds
          gradientColors={["#0c2d48", "#1a4a6e", "#0a1f33", "#145280"]}
          angle={20}
          noise={0}
          blindCount={isMobile ? 5 : 16}
          blindMinWidth={60}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Main content */}
      <div className="min-h-screen relative z-30 max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-16 pointer-events-none">
        
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="/aice-logo.png" 
            alt="AICE" 
            className="w-[72px] h-[72px] rounded-[18px]"
          />
        </div>

        {/* Headline */}
        <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-semibold text-white leading-[1.05] tracking-[-0.035em] mb-7">
          Master AI.
          <br />
          Stay Ahead.
        </h1>

        {/* Subheadline */}
        <p className="text-[17px] sm:text-[19px] text-[#8a8a9a] max-w-[480px] mx-auto mb-11 leading-[1.6] tracking-[-0.015em] font-light">
          Weekly newsletter with the latest AI tools, practical tips, and exclusive course updates. 
          Join <span className="text-[#b8b8c8] font-normal">10,000+ professionals</span> leveling up with AI.
        </p>

        {/* Email signup form */}
        {!isSubmitted ? (
          <div className="w-full max-w-[420px] mx-auto space-y-5 pointer-events-auto">
            <form
              onSubmit={handleJoinNewsletter}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-[52px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#5a5a6a] rounded-[10px] focus:border-white/20 focus:ring-0 text-[15px] tracking-[-0.01em] font-light"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-[52px] px-8 bg-white hover:bg-[#f0f0f0] text-[#0a0a0a] font-medium rounded-[10px] transition-colors duration-150 text-[15px] tracking-[-0.01em]"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-[13px] text-[#4a4a5a] tracking-[-0.01em] font-light">
              Free forever · No spam · Unsubscribe anytime
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[420px] mx-auto p-7 bg-white/[0.03] border border-white/[0.06] rounded-[14px] pointer-events-auto">
            <p className="text-white font-medium text-[18px] mb-2 tracking-[-0.02em]">
              You're in.
            </p>
            <p className="text-[#6a6a7a] text-[14px] tracking-[-0.01em] font-light">
              Check your inbox for a welcome email. Your AI journey starts now.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-[#3a3a4a] text-[12px] tracking-[0.02em] font-light uppercase">
          © 2026 AICE
        </div>
      </div>
    </div>
  );
}
