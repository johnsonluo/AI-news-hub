import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CATEGORY_MAP } from "@/lib/data";

interface CategoryFilterProps {
  categories: (Category | "All")[];
  selectedCategory: Category | "All";
  onSelectCategory: (category: Category | "All") => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          )}
        >
          {CATEGORY_MAP[category] || category}
        </button>
      ))}
    </div>
  );
}
