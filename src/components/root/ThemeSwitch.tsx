import React, { JSX, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export const ThemeSwitch = ({ nonce }: { nonce?: string }): JSX.Element => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Component is now mounted, and we can safely perform client-side operations
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Only render the button after the component has mounted
  if (!mounted) {
    return <></>;
  }

  return (
    <Button
      aria-label="Toggle theme"
      nonce={nonce}
      size="icon"
      variant={"ghost"}
      onClick={toggleTheme}
    >
      <motion.div
        key={theme} // This ensures the animation runs on theme change
        animate={{ rotate: 360 }}
        initial={{ rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </motion.div>
    </Button>
  );
};
