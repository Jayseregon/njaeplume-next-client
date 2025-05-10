"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import SimpleCookieBanner from "./SimpleCookieBanner";

interface UsercentricsCookieConsentProps {
  nonce?: string;
  settingsId: string;
  translationsUrl?: string;
}

export default function UsercentricsCookieConsent({
  nonce,
  settingsId,
  translationsUrl,
}: UsercentricsCookieConsentProps) {
  const [isClient, setIsClient] = useState(false);
  const [showUsercentrics, setShowUsercentrics] = useState(false);
  const [showSimpleBanner, setShowSimpleBanner] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const hasExistingConsent =
      (typeof window !== "undefined" &&
        document.cookie.includes("ucConsent")) ||
      localStorage.getItem("uc-settings");

    if (hasExistingConsent) {
      setShowSimpleBanner(false);
      setTimeout(() => {
        setShowUsercentrics(true);
      }, 3000);
    }
  }, []);

  const ensureUcUiIsReady = (
    callback: () => void,
    maxRetries = 15, // Increased retries for potentially slower networks
    interval = 200,
  ) => {
    let retries = 0;
    const attempt = () => {
      if (typeof window !== "undefined" && (window as any).UC_UI) {
        callback();
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(attempt, interval);
      } else {
        console.warn(
          "Usercentrics UI (UC_UI) did not become available in time.",
        );
      }
    };

    // Ensure Usercentrics script is at least scheduled to load before starting checks
    if (showUsercentrics) {
      attempt();
    } else {
      // If setShowUsercentrics was just called, wait a tick for state to apply
      // and for the script loader to potentially start.
      setTimeout(attempt, 0);
    }
  };

  const handleAcceptAll = () => {
    // SimpleCookieBanner handles its own visibility and localStorage for "simple-cookie-consent"
    setShowUsercentrics(true);
    ensureUcUiIsReady(() => {
      if (typeof window !== "undefined" && (window as any).UC_UI) {
        (window as any).UC_UI.acceptAllConsents();
      }
    });
  };

  const handleCustomize = () => {
    // SimpleCookieBanner handles its own visibility
    setShowUsercentrics(true);
    ensureUcUiIsReady(() => {
      if (typeof window !== "undefined" && (window as any).UC_UI) {
        (window as any).UC_UI.showSecondLayer();
      }
    });
  };

  if (!isClient) return null;

  return (
    <>
      {showSimpleBanner && (
        <SimpleCookieBanner
          onAccept={handleAcceptAll}
          onCustomize={handleCustomize}
        />
      )}

      {/* uc-block.bundle.js is now loaded in layout.tsx's Head */}

      {/* Only load the full Usercentrics UI script when needed */}
      {showUsercentrics && (
        <Script
          data-settings-id={settingsId}
          id="usercentrics-cmp"
          nonce={nonce}
          src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (
              translationsUrl &&
              typeof window !== "undefined" &&
              (window as any).uc
            ) {
              (window as any).uc.setCustomTranslations(translationsUrl);
            }
          }}
        />
      )}
    </>
  );
}
