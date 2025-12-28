export type Category = 
  | 'LLM' 
  | 'Vision' 
  | 'Audio'
  | 'Multimodal'
  | 'Research' 
  | 'Industry' 
  | 'Tools'
  | 'Hardware'
  | 'Applications';


export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  category: Category;
  imageUrl?: string;
}

export interface DailySummary {
  date: string;
  highlights: string[];
  trendingTopic: string;
  summaryText: string;
  generatedAt?: string;
}
