import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/lib/news-service';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { DailySummary } from '@/lib/types';
import dayjs from 'dayjs';

export async function POST() {
  try {
    // 1. 获取最新新闻数据（强制刷新）
    const news = await fetchLatestNews(true);
    
    if (!news || news.length === 0) {
      return NextResponse.json({ error: 'No news available to summarize' }, { status: 400 });
    }

    // 2. 初始化 OpenAI 客户端
    const cookieStore = cookies();
    const apiKey = cookieStore.get('ds_api_key')?.value;
    const baseUrl = cookieStore.get('ds_base_url')?.value || 'https://api.deepseek.com';

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 401 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    });

    // 3. 构建 Prompt
    // 仅取前 10 条新闻进行总结，避免 Token 过多导致生成慢
    const topNews = news.slice(0, 10);
    const newsContent = topNews.map((item, index) => 
      `${index + 1}. ${item.title}\n${item.summary}`
    ).join('\n\n');

    const prompt = `
    请根据以下最新的 AI 新闻，生成一份每日简报。
    
    新闻列表：
    ${newsContent}

    请返回纯 JSON 格式（不要包含 markdown 代码块标记），包含以下字段：
    - trendingTopic: (字符串) 根据新闻内容总结的一个热门话题短语（如“GPT-5 发布”或“AI 视频生成突破”）。
    - highlights: (字符串数组) 3个关键新闻亮点的简短列表（每个亮点一句话）。
    - summaryText: (字符串) 一段 150-200 字的连贯总结文本，概述今天的 AI 重点动态。

    请确保所有内容使用中文。
    `;

    // 4. 调用大模型
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI news editor. You summarize tech news into concise, engaging daily briefs." },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat",
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    // 5. 解析结果
    const result = JSON.parse(content);
    
    const summary: DailySummary = {
      date: new Date().toISOString(),
      trendingTopic: result.trendingTopic || "AI 今日动态",
      highlights: Array.isArray(result.highlights) ? result.highlights : [],
      summaryText: result.summaryText || "无法生成总结。",
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Summary generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
