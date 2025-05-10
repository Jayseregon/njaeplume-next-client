"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

import { Button } from "../ui/button";

interface SimpleCookieBannerProps {
  onAccept: () => void;
  onCustomize: () => void;
}

export default function SimpleCookieBanner({
  onAccept,
  onCustomize,
}: SimpleCookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if cookies have been accepted before
    const hasConsent = localStorage.getItem("simple-cookie-consent");

    if (!hasConsent) {
      // Show banner after a longer delay to prioritize main content render
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000); // Increased delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("simple-cookie-consent", "accepted");
    setVisible(false);
    onAccept();
  };

  const handleCustomize = () => {
    setVisible(false);
    onCustomize();
  };

  if (!visible) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-foreground z-50"
      initial={{ opacity: 0, y: 20 }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground">
          This site uses cookies to enhance your experience. By continuing, you
          agree to our use of cookies.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCustomize}>
            Customize
          </Button>
          <Button variant="form" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
