import Parser from 'rss-parser';
import { NewsItem, Category } from '@/lib/types';
import { MOCK_NEWS } from './data';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const parser = new Parser({
  timeout: 5000, // 5 seconds timeout per feed
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

// 使用 LLM 处理单条新闻：翻译 + 智能分类
async function processNewsWithLLM(title: string, content: string, client: OpenAI): Promise<{ title: string; summary: string; category: Category }> {
  try {
    const cleanContent = content.replace(/<[^>]*>?/gm, '').slice(0, 300); // 限制输入长度
    
    const completion = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are an AI news editor. Your task is to process a tech news item.
1. Translate the title and summary to simplified Chinese (if they are not already).
2. Classify the news into ONE of these categories: 'LLM', 'Computer Vision', 'Industry', 'Research', 'Tools'.

Return ONLY a JSON object with this structure:
{
  "translatedTitle": "string",
  "translatedSummary": "string",
  "category": "string"
}` 
        },
        { 
          role: "user", 
          content: `Title: ${title}\n\nContent: ${cleanContent}` 
        }
      ],
      model: "deepseek-chat",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    // 验证返回的 category 是否合法
    const validCategories: Category[] = ['LLM', 'Computer Vision', 'Industry', 'Research', 'Tools'];
    let category: Category = 'Industry';
    if (validCategories.includes(result.category)) {
      category = result.category as Category;
    } else {
      category = determineCategory(result.translatedTitle || title, result.translatedSummary || cleanContent);
    }

    return {
      title: result.translatedTitle || title,
      summary: result.translatedSummary || cleanContent.slice(0, 150) + '...',
      category: category
    };
  } catch (error) {
    console.error("LLM processing failed:", error);
    // Fallback: 返回原文和基于规则的分类
    const cleanSummary = content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
    return {
      title: title,
      summary: cleanSummary,
      category: determineCategory(title, cleanSummary)
    };
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

  // 设置 15 秒的总超时时间 (因为引入了 LLM 处理，可能会变慢)
  const timeoutPromise = new Promise<NewsItem[]>((resolve) => {
    setTimeout(() => {
      console.warn('[NewsService] News fetch timed out (15s), returning mock/cached data.');
      resolve(cachedNews || MOCK_NEWS);
    }, 15000);
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
        timeout: 10000, // OpenAI 单次请求超时 10s
      });
    }

    try {
      const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
        try {
          const feed = await parser.parseURL(feedConfig.url);
          
          // 限制每个源最多取 3 条，避免并发过高导致卡顿或 API 限制
          const items = feed.items.slice(0, 3);

          const processedItems = await Promise.all(items.map(async (item) => {
            const rawTitle = item.title || '无标题';
            const rawContent = item.contentSnippet || item.content || '';
            const imageUrl = extractImage(item.content || '') || 
              `https://images.unsplash.com/photo-${['1677442136019-21780ecad995', '1620712943543-bcc4688e7485', '1591488320449-011701bb6704'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&q=80&w=800`;

            let processedData;

            // 如果配置了 OpenAI 且内容看起来像英文（或需要智能分类），则调用 LLM
            // 简单判断：如果 title 不是中文，或者我们强制想要智能分类
            if (openai) {
               processedData = await processNewsWithLLM(rawTitle, rawContent, openai);
            } else {
               // 无 API Key，回退到规则处理
               const cleanSummary = rawContent.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
               processedData = {
                 title: rawTitle,
                 summary: cleanSummary,
                 category: determineCategory(rawTitle, cleanSummary)
               };
            }

            return {
              id: item.guid || item.link || Math.random().toString(),
              title: processedData.title,
              summary: processedData.summary,
              url: item.link || '#',
              source: feedConfig.source,
              date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              category: processedData.category,
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
