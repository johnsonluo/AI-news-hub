import { fetchLatestNews } from "@/lib/news-service";
import NewsFeed from "@/components/NewsFeed";

// 强制动态渲染，以获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 每小时重新验证一次

export default async function Home() {
  const latestNews = await fetchLatestNews();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          最新 AI 资讯
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          实时汇聚全球科技博客与新闻，随时掌握人工智能领域的最新突破。
        </p>
      </div>

      <NewsFeed initialNews={latestNews} />
    </div>
  );
}
