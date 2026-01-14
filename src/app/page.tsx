"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { toast } from "sonner";
import GradientBlinds from "@/components/landing/gradient-blinds";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, Check } from "lucide-react";
import { collectUserData } from "@/lib/utils/user-data";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageLoadTime] = useState(new Date().toISOString());

  // Track time on page
  useEffect(() => {
    if (isSubmitted) {
      const timeOnPage = Math.round(
        (new Date().getTime() - new Date(pageLoadTime).getTime()) / 1000
      );
      // Store time on page in sessionStorage for later use
      sessionStorage.setItem("timeOnPage", timeOnPage.toString());
    }
  }, [isSubmitted, pageLoadTime]);

  const handleJoinNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Check if Firebase is initialized
      if (!db) {
        throw new Error("Firebase not initialized. Check your .env.local file and restart the server.");
      }

      // Collect comprehensive user data
      const userData = await collectUserData(email, "landing_page");
      
      // Calculate time on page
      const timeOnPage = Math.round(
        (new Date().getTime() - new Date(pageLoadTime).getTime()) / 1000
      );
      
      // Add time on page to user data
      const finalUserData = {
        ...userData,
        session: {
          ...userData.session,
          timeOnPage,
        },
      };

      // Remove undefined values (Firestore doesn't like them)
      const cleanData = JSON.parse(JSON.stringify(finalUserData));

      // Save to Firestore (using email as document ID)
      await setDoc(doc(db, "newsletter_subscribers", email), cleanData);
      
      setIsSubmitted(true);
      toast.success("Successfully subscribed to AICE!");
    } catch (error) {
      console.error("Error subscribing:", error);
      
      // Show detailed error in console
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code) {
        console.error("Firebase error code:", firebaseError.code);
        console.error("Firebase error message:", firebaseError.message);
      }
      
      // User-friendly error message
      let errorMessage = "Failed to subscribe. Please try again.";
      if (firebaseError.code === "permission-denied") {
        errorMessage = "Permission denied. Check Firestore rules.";
      } else if (firebaseError.code === "unavailable") {
        errorMessage = "Service unavailable. Check your internet connection.";
      } else if (firebaseError.message?.includes("Firebase not initialized")) {
        errorMessage = "Firebase not configured. Check .env.local file.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* GradientBlinds as background */}
      <div className="absolute inset-0 w-full h-full z-10" aria-hidden="true">
        <GradientBlinds
          gradientColors={["#640d5f", "#5227FF"]}
          angle={20}
          noise={0}
          blindCount={isMobile ? 4 : 16}
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
      <div className="min-h-screen relative z-20 flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="animate-reveal mb-12">
            <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden logo-wrapper">
              <Image
                src="/aice-logo.png"
                alt="AICE"
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-xl logo-image"
                priority
              />
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-reveal delay-100 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] text-white leading-[1.1] mb-6">
            Master AI.
            <br />
            <span className="text-white/70">Stay Ahead.</span>
          </h1>

          {/* Subtext */}
          <p className="animate-reveal delay-200 text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-12 leading-relaxed">
            Weekly newsletter with the latest AI tools, practical tips, and
            exclusive course updates. Join{" "}
            <span className="text-white/80">10,000+</span> professionals
            leveling up with AI.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <div className="animate-reveal delay-300">
              <div className="glass-card rounded-2xl p-6 md:p-8 max-w-lg mx-auto">
                <form
                  onSubmit={handleJoinNewsletter}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-premium flex-1 h-12 px-5 rounded-lg text-base"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium h-12 px-6 rounded-lg text-sm inline-flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Trust text */}
                <p className="animate-reveal-fade delay-500 mt-5 text-sm text-white/40 text-center">
                  Free forever · No spam · Unsubscribe anytime
                </p>
              </div>
            </div>
          ) : (
            /* Success state */
            <div className="animate-reveal">
              <div className="success-card inline-flex items-center gap-3 px-6 py-4 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">You&apos;re in!</p>
                  <p className="text-white/50 text-sm">
                    Check your inbox for a welcome email
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
