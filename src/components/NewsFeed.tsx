"use client";

import { useState } from "react";
import { NewsItem, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import NewsCard from "./NewsCard";
import CategoryFilter from "./CategoryFilter";

interface NewsFeedProps {
  initialNews: NewsItem[];
}

export default function NewsFeed({ initialNews }: NewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  const filteredNews = selectedCategory === "All"
    ? initialNews
    : initialNews.filter((item) => item.category === selectedCategory);

  return (
    <>
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
      
      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">该分类下暂无资讯。</p>
        </div>
      )}
    </>
  );
}
