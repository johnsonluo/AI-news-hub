"use client";

import { useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next";
import { Save, Key, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    const savedKey = getCookie("ds_api_key");
    const savedUrl = getCookie("ds_base_url");
    if (savedKey) setApiKey(savedKey as string);
    if (savedUrl) setBaseUrl(savedUrl as string);
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;

    // Save to cookies (valid for 30 days)
    setCookie("ds_api_key", apiKey, { maxAge: 60 * 60 * 24 * 30 });
    setCookie("ds_base_url", baseUrl, { maxAge: 60 * 60 * 24 * 30 });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="text-gray-500 dark:text-gray-400">
          配置大模型 API 以启用自动翻译功能。推荐使用 DeepSeek API。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Key size={16} />
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <p className="text-xs text-gray-500">
            您的 API Key 仅存储在本地 Cookie 中，用于向 DeepSeek 发送翻译请求。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Base URL (可选)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!apiKey.trim()}
          >
            {isSaved ? <CheckIcon /> : <Save size={18} />}
            {isSaved ? "已保存" : "保存配置"}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-blue-800 dark:text-blue-300 text-sm">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <p>
          配置完成后，新的资讯流将尝试使用该 API 自动翻译成中文。请确保您的账户有足够的余额。
          由于 LLM 响应速度限制，翻译可能会增加页面加载时间。
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
