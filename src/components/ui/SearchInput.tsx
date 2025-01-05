import { useState, useRef, useEffect } from "react";
import { Input, Kbd } from "@nextui-org/react";

import { SearchIcon } from "@/components/icons";

export const SearchInput = ({ alwaysExpanded = false }) => {
  // Search state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Expand search input if alwaysExpanded is true (inside toggle menu)
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
  }, []);

  return (
    <div ref={searchInputRef}>
      {isSearchExpanded || alwaysExpanded ? (
        <Input
          aria-label="Search"
          classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
          }}
          endContent={
            <Kbd className="hidden lg:inline-block" keys={["command"]}>
              K
            </Kbd>
          }
          labelPlacement="outside"
          placeholder="Search..."
          startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          }
          type="search"
        />
      ) : (
        <SearchIcon className="cursor-pointer" onClick={toggleSearch} />
      )}
    </div>
  );
};

export default SearchInput;
