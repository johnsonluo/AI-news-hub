import { NewsItem } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/data";
import { ExternalLink, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
      {item.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
            <Tag size={12} />
            {CATEGORY_MAP[item.category] || item.category}
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1 ml-auto">
            <Calendar size={12} />
            {dayjs(item.date).format("YYYY-MM-DD")}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
          {item.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 font-medium">来源: {item.source}</span>
          <Link 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            阅读全文 <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
