

export interface Competitor {
  name: string;
  website: string;
}

export interface BrandProfile {
  name: string;
  website: string;
  industry: string;
  competitors: Competitor[];
}

export interface Topic {
  id: string;
  name: string;
  selected: boolean;
  justification?: string; // e.g. "Detected on your Product page"
}

export interface PromptAnalysisResult {
  id: string;
  topic: string;
  text: string;
  intent: 'Comparison' | 'Discovery' | 'Commercial' | 'Informational';
  isEdited?: boolean;
  
  // Post-Analysis Data
  responseDate: string;
  model: string; // Fixed to 'ChatGPT-4o' for this view
  responseText: string;
  brandMentioned: boolean;
  competitorsMentioned: string[]; // Names of competitors found
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  rank: number | null; // e.g. 1 (Top recommendation), null (Not found)
  
  // New Detailed Insights
  citations: { source: string; url: string; title?: string }[];
  recommendation: string;
}

export type GeneratedPrompt = PromptAnalysisResult; 

export interface AnalysisReport {
  overallScore: number;
  shareOfVoice: {
    brand: string;
    score: number;
    sentiment: number; // -1 to 1
    mentions: number;
    trend: number[]; // Array of last 6 months SOV scores
    positiveMentions: number;
    negativeMentions: number;
    winRate: number; // % of head-to-head comparisons won
  }[];
  topicScores: {
    topic: string;
    brandScore: number;
    competitorAvg: number;
  }[];
  citations: {
    source: string;
    domainAuthority: 'High' | 'Medium' | 'Low';
    mentioned: boolean;
    url: string;
    count: number;
  }[];
  contentGaps: {
    title: string;
    type: string; // Comparison, Blog, Guide
    reason: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }[];
  citationOpportunities: {
    site: string;
    relevance: 'High' | 'Medium';
    contactGuess: string;
    pitchAngle: string;
    missing: boolean;
  }[];
  promptsGenerated: PromptAnalysisResult[];
}

export enum AppStep {
  WELCOME = 'WELCOME',
  INPUT = 'INPUT',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  PROMPT_PREVIEW = 'PROMPT_PREVIEW',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD'
}

export type ContentTone = 'Professional' | 'Conversational' | 'Authoritative' | 'Persuasive' | 'Witty';
