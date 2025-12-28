import { NewsItem, DailySummary } from './types';

export const CATEGORIES: ('All' | import('./types').Category)[] = ['All', 'LLM', 'Computer Vision', 'Industry', 'Research', 'Tools'];

export const CATEGORY_MAP: Record<string, string> = {
  'All': '全部',
  'LLM': '大语言模型',
  'Computer Vision': '计算机视觉',
  'Industry': '行业动态',
  'Research': '前沿研究',
  'Tools': '工具框架'
};

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI 发布 GPT-4o 全能模型',
    summary: 'OpenAI 发布了最新的旗舰模型 GPT-4o，具备实时音频、视觉和文本推理能力，并将免费向所有用户开放。',
    url: 'https://openai.com/index/hello-gpt-4o/',
    source: 'OpenAI Blog',
    date: new Date().toISOString(),
    category: 'LLM',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Google DeepMind AlphaGeometry 突破',
    summary: 'AlphaGeometry 系统解决了国际数学奥林匹克竞赛级别的几何题目，无需人类演示即可通过逻辑推理寻找证明。',
    url: 'https://deepmind.google/discover/blog/alphageometry-an-olympiad-level-ai-system-for-geometry/',
    source: 'Google DeepMind',
    date: new Date().toISOString(),
    category: 'Research',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'NVIDIA 推出 Blackwell B200 GPU',
    summary: 'NVIDIA 推出了“世界最强芯片” Blackwell B200 GPU，旨在大幅降低万亿参数大模型的训练和推理成本。',
    url: 'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing',
    source: 'NVIDIA News',
    date: new Date().toISOString(),
    category: 'Industry',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'Midjourney v6 显著提升图像真实感',
    summary: 'Midjourney v6 版本正式发布，显著提升了提示词跟随能力、图像连贯性和文本渲染能力，生成效果更加逼真。',
    url: 'https://www.midjourney.com/home',
    source: 'Midjourney',
    date: new Date().toISOString(),
    category: 'Computer Vision',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    title: 'LangChain v0.2 正式发布',
    summary: 'LangChain v0.2 带来了更好的流式支持、标准化的工具调用接口以及更模块化的架构设计。',
    url: 'https://blog.langchain.dev/langchain-v0-2-released/',
    source: 'LangChain Blog',
    date: new Date().toISOString(),
    category: 'Tools',
  }
];

export const MOCK_SUMMARY: DailySummary = {
  date: new Date().toISOString(),
  trendingTopic: "多模态大模型与算力升级",
  highlights: [
    "OpenAI GPT-4o 重新定义人机交互，实时多模态能力惊艳全场。",
    "NVIDIA Blackwell 平台开启万亿参数模型计算新时代。",
    "Google AlphaGeometry 展示了 AI 在复杂数学推理上的突破。"
  ],
  summaryText: "今日 AI 领域的焦点无疑是 OpenAI 发布的 GPT-4o，其端到端的实时多模态能力标志着人机交互迈入新阶段。在硬件层面，NVIDIA 的 Blackwell B200 芯片为未来的巨型模型训练提供了算力保障。与此同时，Google DeepMind 在数学推理领域的突破（AlphaGeometry）再次证明了 AI 在解决复杂逻辑问题上的潜力。这些进展共同描绘了一个更智能、更高效的 AI 未来。"
};
