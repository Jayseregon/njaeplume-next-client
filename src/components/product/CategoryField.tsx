import React from "react";
import { Category } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CategoryFieldProps {
  selectedCategory: Category | null | string;
  onChange: (category: string) => void;
  readOnly?: boolean;
}

export const CategoryField: React.FC<CategoryFieldProps> = ({
  selectedCategory,
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground" htmlFor="category-select">
        Category
      </Label>
      {/* Hidden input to store the value for form submission */}
      <Input
        id="category"
        name="category"
        type="hidden"
        value={selectedCategory || ""}
      />
      <Select
        disabled={readOnly}
        value={(selectedCategory as string) || ""}
        onValueChange={onChange}
      >
        <SelectTrigger
          className={readOnly ? "opacity-70 cursor-not-allowed" : ""}
          id="category-select"
        >
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Category).map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
