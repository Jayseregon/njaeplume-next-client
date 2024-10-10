import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeSwitchProps {
  className?: string;
  nonce?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  className,
  nonce,
}) => {
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
    return null;
  }

  return (
    <Button
      aria-label="Toggle theme"
      className={className}
      color={undefined}
      isIconOnly={true}
      nonce={nonce}
      size="sm"
      variant={undefined}
      onPress={toggleTheme}
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
