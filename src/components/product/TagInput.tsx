"use client";

import { useState, useEffect, KeyboardEvent, useRef, MouseEvent } from "react";
import { Tag } from "@prisma/client";
import { X, PlusCircle } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { createTagIfNotExists, getTags } from "@/src/actions/prisma/action";

interface TagInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all tags on component mount
  useEffect(() => {
    async function loadTags() {
      setLoading(true);
      try {
        const fetchedTags = await getTags();

        setAllTags(fetchedTags);
      } catch (error) {
        console.error("Failed to load tags:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  // Handle key presses in the input field
  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    // Create tag on Enter, comma, semicolon or space
    if ([" ", ";", ",", "Enter"].includes(event.key) && inputValue.trim()) {
      event.preventDefault();
      await handleAddTag();
    } else if (event.key === "Escape") {
      // Close suggestions on escape
      setShowSuggestions(false);
    } else if (event.key === "ArrowDown" && showSuggestions) {
      // Handle keyboard navigation for suggestions
      event.preventDefault();
      const firstSuggestion = suggestionsRef.current?.querySelector("div");

      if (firstSuggestion) {
        (firstSuggestion as HTMLDivElement).focus();
      }
    }
  };

  // Handle creating and adding a new tag
  const handleAddTag = async () => {
    if (!inputValue.trim()) return;

    try {
      setLoading(true);
      const newTag = await createTagIfNotExists(inputValue.trim());

      if (newTag && !selectedTags.some((tag) => tag.id === newTag.id)) {
        onChange([...selectedTags, newTag]);

        // Add to available tags list if not already there
        if (!allTags.some((tag) => tag.id === newTag.id)) {
          setAllTags((prevTags) => [...prevTags, newTag]);
        }
      }

      setInputValue("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to add tag:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a tag from suggestions
  const handleSelectTag = (selectedTag: Tag, e?: MouseEvent) => {
    // Stop propagation to prevent immediate closing of dropdown
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!selectedTags.some((tag) => tag.id === selectedTag.id)) {
      onChange([...selectedTags, selectedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle removing a selected tag - now the entire badge is clickable
  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  // Filter suggestions based on input
  const filteredSuggestions = allTags
    .filter((tag) => !selectedTags.some((selected) => selected.id === tag.id))
    .filter((tag) => tag.name.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 5); // Limit to 5 suggestions

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      // Don't close if clicking inside the input or suggestions
      if (
        inputRef.current?.contains(event.target) ||
        suggestionsRef.current?.contains(event.target)
      ) {
        return;
      }
      setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          className="w-full"
          disabled={loading}
          placeholder="Type to add tags (press Space, Enter or comma to add)"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onClick={() => setShowSuggestions(inputValue.length > 0)}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onKeyDown={handleKeyDown}
        />

        {/* Tag suggestions dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 bg-white dark:bg-neutral-900 border rounded-md mt-1 z-50 py-1 shadow-md max-h-60 overflow-auto"
          >
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((tag) => (
                <div
                  key={tag.id}
                  className="px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleSelectTag(tag, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTag(tag);
                    }
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2 opacity-70" />
                  {tag.name}
                </div>
              ))
            ) : inputValue.trim() ? (
              <div
                className="px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center"
                role="button"
                tabIndex={0}
                onClick={() => handleAddTag()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2 opacity-70" />
                Create &quot;{inputValue}&quot;
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No tags found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected tags display - Entire badge is now clickable for removal */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              aria-label={`Remove ${tag.name} tag`}
              className="px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-primary-600 transition-colors"
              role="button"
              tabIndex={0}
              variant="primary"
              onClick={() => handleRemoveTag(tag.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRemoveTag(tag.id);
                }
              }}
            >
              {tag.name}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        name="tagIds"
        type="hidden"
        value={selectedTags.map((tag) => tag.id).join(",")}
      />
    </div>
  );
}
