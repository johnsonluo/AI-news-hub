"use client";

import { useState } from "react";
import { MOCK_SUMMARY } from "@/lib/data";
import { DailySummary } from "@/lib/types";
import DailySummaryCard from "@/components/DailySummaryCard";
import { RefreshCw, Sparkles } from "lucide-react";
import { getCookie } from "cookies-next";

export default function SummaryPage() {
  const [summary, setSummary] = useState<DailySummary>(MOCK_SUMMARY);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    // 检查是否有 API Key
    const apiKey = getCookie("ds_api_key");
    if (!apiKey) {
      setError("请先在设置页面配置 DeepSeek API Key 才能使用 AI 自动总结功能。");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/summary/generate", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "生成失败");
      }

      const newSummary = await response.json();
      setSummary(newSummary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成总结时发生错误，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          每日 AI 总结
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          今日最重要 AI 进展的简要概述。支持一键生成图片分享给您的网络！
        </p>
        
        <div className="flex justify-center pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            {isGenerating ? "正在分析今日资讯..." : "AI 实时生成今日总结"}
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm animate-fade-in bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-lg inline-block">
            {error}
          </p>
        )}
      </div>

      <DailySummaryCard summary={summary} />
    </div>
  );
}
