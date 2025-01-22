import { useState, useRef, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/icons";

export const SearchInput = ({
  alwaysExpanded = false,
  nonce,
}: {
  alwaysExpanded?: boolean;
  nonce?: string;
}) => {
  // Search state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    if (alwaysExpanded) {
      setIsSearchExpanded(true);
    }
  }, [alwaysExpanded]);

  const toggleSearch = () => {
    if (!alwaysExpanded) {
      setIsSearchExpanded(!isSearchExpanded);
    }
  };

  // Close search input when not focused
  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        !alwaysExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [alwaysExpanded]);

  return (
    <div ref={searchInputRef}>
      {isSearchExpanded || alwaysExpanded ? (
        <Input
          aria-label="Search"
          className="text-sm mt-1 block w-full bg-neutral-50 dark:bg-neutral-200 text-foreground dark:text-background border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
          placeholder="Search..."
          type="search"
        />
      ) : (
        <Button
          aria-label="Toggle Search"
          nonce={nonce}
          size="icon"
          variant={"ghost"}
          onClick={toggleSearch}
        >
          <SearchIcon />
        </Button>
      )}
    </div>
  );
};
