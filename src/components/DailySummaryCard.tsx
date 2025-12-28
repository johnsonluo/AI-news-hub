"use client";

import { useRef, useState } from "react";
import { DailySummary } from "@/lib/types";
import { Download, Check, Copy } from "lucide-react";
import html2canvas from "html2canvas";
import dayjs from "dayjs";

interface DailySummaryCardProps {
  summary: DailySummary;
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff", // Ensure white background
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `ai-news-summary-${dayjs().format("YYYY-MM-DD")}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    const text = `📅 AI 每日简报 - ${dayjs(summary.date).format("YYYY-MM-DD")}\n\n🔥 热门话题: ${summary.trendingTopic}\n\n${summary.highlights.map(h => `• ${h}`).join("\n")}\n\n${summary.summaryText}\n\n阅读更多请访问 AI News Hub!`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          {isCopied ? <Check size={18} /> : <Copy size={18} />}
          {isCopied ? "已复制!" : "复制文本"}
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {isDownloading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            <Download size={18} />
          )}
          下载图片
        </button>
      </div>

      <div 
        ref={cardRef} 
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto"
      >
        <div className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">每日 AI 简报</h2>
            <div className="text-right">
              <span className="block text-gray-900 font-medium">{dayjs(summary.date).format("YYYY-MM-DD")}</span>
              {summary.generatedAt && (
                <span className="block text-xs text-gray-400 mt-1">
                  生成于: {dayjs(summary.generatedAt).format("HH:mm:ss")}
                </span>
              )}
            </div>
          </div>
          <p className="text-blue-600 font-medium">热门话题: {summary.trendingTopic}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🚀</span> 核心亮点
            </h3>
            <ul className="space-y-2">
              {summary.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span> 详细总结
            </h3>
            <p className="text-gray-700 leading-relaxed text-justify">
              {summary.summaryText}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <span>AI News Hub</span>
          </div>
          <span>ainewshub.com</span>
        </div>
      </div>
    </div>
  );
}
