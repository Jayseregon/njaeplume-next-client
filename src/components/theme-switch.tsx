import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";

import { SunIcon, MoonIcon } from "@/components/icons";

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
    <div>
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
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  );
};
