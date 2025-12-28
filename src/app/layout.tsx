import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Newspaper, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "AI 资讯中心",
  description: "每日 AI 资讯与总结",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center gap-2">
                    <Newspaper className="h-8 w-8 text-blue-600" />
                    <span className="font-bold text-xl text-gray-900 dark:text-white">AI 资讯中心</span>
                  </Link>
                </div>
                <nav className="flex items-center space-x-4">
                  <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">资讯流</Link>
                  <Link href="/summary" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">每日总结</Link>
                  <Link href="/settings" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="设置">
                    <Settings size={20} />
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} AI News Hub. Powered by Trae.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
