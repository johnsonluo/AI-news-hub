import Parser from 'rss-parser';
import { NewsItem, Category } from '@/lib/types';
import { MOCK_NEWS } from './data';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const parser = new Parser({
  timeout: 3000, // 3 seconds timeout per feed
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const RSS_FEEDS = [
  {
    url: 'https://www.jiqizhixin.com/rss',
    source: '机器之心',
    category: 'Industry'
  },
  // {
  //   url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  //   source: 'TechCrunch (AI)',
  //   category: 'Industry'
  // },
  {
    url: 'https://hnrss.org/newest?q=AI',
    source: 'Hacker News AI',
    category: 'Tools'
  }
];

function determineCategory(title: string, content: string): Category {
  const text = (title + content).toLowerCase();
  
  if (text.includes('gpt') || text.includes('llm') || text.includes('大模型') || text.includes('claude') || text.includes('llama')) return 'LLM';
  if (text.includes('vision') || text.includes('image') || text.includes('video') || text.includes('midjourney') || text.includes('sora') || text.includes('视觉')) return 'Computer Vision';
  if (text.includes('paper') || text.includes('research') || text.includes('arxiv') || text.includes('论文') || text.includes('研究')) return 'Research';
  if (text.includes('tool') || text.includes('framework') || text.includes('langchain') || text.includes('library') || text.includes('工具')) return 'Tools';
  
  return 'Industry';
}

function extractImage(content: string): string | undefined {
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : undefined;
}

function isChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

// 翻译单个文本
async function translateText(text: string, client: OpenAI): Promise<string> {
  if (isChinese(text)) return text;
  
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a professional translator. Translate the following English tech news text into concise Chinese. Do not add any explanations." },
        { role: "user", content: text }
      ],
      model: "deepseek-chat", // 默认使用 deepseek-chat，用户配置的 URL 会决定实际请求去向
      temperature: 0.3,
    });
    return completion.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

// 简单的内存缓存
let cachedNews: NewsItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟

export async function fetchLatestNews(forceRefresh = false): Promise<NewsItem[]> {
  console.log('[NewsService] Fetching news...', forceRefresh ? '(Force Refresh)' : '');
  // 检查缓存
  if (!forceRefresh && cachedNews && Date.now() - lastFetchTime < CACHE_DURATION) {
    console.log('[NewsService] Returning cached news');
    return cachedNews;
  }

  // 设置 5 秒的总超时时间
  const timeoutPromise = new Promise<NewsItem[]>((resolve) => {
    setTimeout(() => {
      console.warn('[NewsService] News fetch timed out (5s), returning mock data.');
      resolve(cachedNews || MOCK_NEWS); // 如果有旧缓存，优先返回旧缓存
    }, 5000);
  });

  const fetchPromise = (async () => {
    // 获取 API 配置
    const cookieStore = cookies();
    const apiKey = cookieStore.get('ds_api_key')?.value;
    const baseUrl = cookieStore.get('ds_base_url')?.value || 'https://api.deepseek.com';

    let openai: OpenAI | null = null;
    if (apiKey) {
      openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        timeout: 5000, // OpenAI 请求超时
      });
    }

    try {
      const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
        try {
          const feed = await parser.parseURL(feedConfig.url);
          
          // 限制每个源最多取 5 条，避免翻译请求过多
          const items = feed.items.slice(0, 5);

          const processedItems = await Promise.all(items.map(async (item) => {
            let title = item.title || '无标题';
            let content = item.contentSnippet || item.content || '';
            
            // 如果有 OpenAI 实例且内容不是中文，尝试翻译
            // 为了加快速度，我们并发翻译标题和摘要
            if (openai && (!isChinese(title) || !isChinese(content.slice(0, 50)))) {
              try {
                  // 清理摘要中的 HTML
                  const cleanSummary = content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
                  
                  const [translatedTitle, translatedSummary] = await Promise.all([
                      translateText(title, openai),
                      translateText(cleanSummary, openai)
                  ]);
                  
                  title = translatedTitle;
                  content = translatedSummary;
              } catch (err) {
                  // 翻译失败降级为原文
                  content = content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
              }
            } else {
               content = content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
            }

            const category = determineCategory(title, content);
            const imageUrl = extractImage(item.content || '') || 
              `https://images.unsplash.com/photo-${['1677442136019-21780ecad995', '1620712943543-bcc4688e7485', '1591488320449-011701bb6704'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&q=80&w=800`;

            return {
              id: item.guid || item.link || Math.random().toString(),
              title: title,
              summary: content,
              url: item.link || '#',
              source: feedConfig.source,
              date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              category: category,
              imageUrl: imageUrl
            } as NewsItem;
          }));

          return processedItems;
        } catch (error) {
          console.error(`Error parsing feed ${feedConfig.url}:`, error);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      const allNews = results.flat();

      allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (allNews.length === 0) {
        return cachedNews || MOCK_NEWS;
      }

      // 更新缓存
      cachedNews = allNews;
      lastFetchTime = Date.now();

      return allNews;
    } catch (error) {
      console.error('Failed to fetch news service:', error);
      return cachedNews || MOCK_NEWS;
    }
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}
