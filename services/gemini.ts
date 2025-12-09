

import { BrandProfile, Topic, AnalysisReport, GeneratedPrompt, ContentTone } from "../types";

// MOCK DATA MODE: Bypassing live API calls to ensure stability for UI testing
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const suggestTopics = async (profile: BrandProfile): Promise<Topic[]> => {
  await wait(1500); // Simulate network delay
  
  return [
    { 
      id: 'topic-1', 
      name: `${profile.industry} Software Tools`, 
      selected: true, 
      justification: `High search volume for general ${profile.industry} solutions.` 
    },
    { 
      id: 'topic-2', 
      name: `${profile.name} vs Competitors`, 
      selected: true, 
      justification: "Direct brand comparison queries detected." 
    },
    { 
      id: 'topic-3', 
      name: 'Best Pricing & ROI', 
      selected: true, 
      justification: "Commercial intent signals found on pricing pages." 
    },
    { 
      id: 'topic-4', 
      name: 'Integration Capabilities', 
      selected: true, 
      justification: "Users frequently ask about API and integrations." 
    },
    { 
      id: 'topic-5', 
      name: 'User Reviews & Sentiment', 
      selected: true, 
      justification: "Aggregated from G2, Capterra, and Reddit discussions." 
    }
  ];
};

export const generatePrompts = async (profile: BrandProfile, topics: Topic[]): Promise<GeneratedPrompt[]> => {
  await wait(2000); // Simulate generation time
  
  const prompts: GeneratedPrompt[] = [];
  const intents = ['Comparison', 'Discovery', 'Commercial', 'Informational'] as const;
  
  topics.filter(t => t.selected).forEach((topic, tIdx) => {
    for (let i = 0; i < 10; i++) {
      prompts.push({
        id: `prompt-${tIdx}-${i}`,
        topic: topic.name,
        intent: intents[i % 4],
        text: `What are the top rated ${profile.industry} tools similar to ${profile.competitors[0]?.name || 'competitors'} that offer better ${topic.name}?`
      });
    }
  });

  return prompts;
};

export const analyzeGEO = async (
  profile: BrandProfile, 
  topics: Topic[], 
  prompts: GeneratedPrompt[]
): Promise<AnalysisReport> => {
  await wait(3000); // Simulate analysis time

  // Mock score calculation
  const overallScore = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
  const generateTrend = () => Array.from({length: 6}, () => Math.floor(Math.random() * 60) + 20);
  
  return {
    overallScore,
    shareOfVoice: [
      { 
        brand: profile.name, 
        score: overallScore, 
        sentiment: 0.6, 
        mentions: 142,
        trend: [30, 35, 38, 42, 55, overallScore],
        positiveMentions: 85,
        negativeMentions: 12,
        winRate: 64
      },
      ...profile.competitors.map(c => ({
        brand: c.name,
        score: Math.floor(Math.random() * 80),
        sentiment: Number((Math.random() * 1.5 - 0.5).toFixed(2)),
        mentions: Math.floor(Math.random() * 200),
        trend: generateTrend(),
        positiveMentions: Math.floor(Math.random() * 100),
        negativeMentions: Math.floor(Math.random() * 50),
        winRate: Math.floor(Math.random() * 80)
      }))
    ].sort((a, b) => b.score - a.score),
    
    engineBreakdown: [
      { engine: "ChatGPT", visibility: 78, topAnswer: "Ranks #2 in 'Best Tools' lists." },
      { engine: "Claude", visibility: 45, topAnswer: "Mentioned as a niche alternative." },
      { engine: "Gemini", visibility: 82, topAnswer: "Featured in comparison tables." },
      { engine: "Perplexity", visibility: 60, topAnswer: "Cited in 3 recent sources." },
      { engine: "Copilot", visibility: 55, topAnswer: "Mixed sentiment in summaries." }
    ],

    topicScores: topics.filter(t => t.selected).map(t => ({
      topic: t.name,
      brandScore: Math.floor(Math.random() * 100),
      competitorAvg: Math.floor(Math.random() * 100)
    })),

    citations: [
      { source: "g2.com", domainAuthority: "High", mentioned: true, url: "https://g2.com", count: 12 },
      { source: "techcrunch.com", domainAuthority: "High", mentioned: false, url: "https://techcrunch.com", count: 0 },
      { source: "reddit.com", domainAuthority: "Medium", mentioned: true, url: "https://reddit.com", count: 45 },
      { source: "capterra.com", domainAuthority: "High", mentioned: true, url: "https://capterra.com", count: 8 },
      { source: "medium.com", domainAuthority: "Medium", mentioned: false, url: "https://medium.com", count: 0 },
      { source: "linkedin.com", domainAuthority: "High", mentioned: true, url: "https://linkedin.com", count: 15 },
    ],

    contentGaps: [
      { 
        title: `Top 10 ${profile.industry} Alternatives for 2024`, 
        type: "Comparison", 
        reason: "Competitors dominate 'Best of' lists while you are missing.", 
        difficulty: "Medium" 
      },
      { 
        title: "How to Calculate ROI for [Solution]", 
        type: "Guide", 
        reason: "High intent query with no direct answer from your domain.", 
        difficulty: "Hard" 
      },
      { 
        title: `${profile.name} vs ${profile.competitors[0]?.name || 'Competitor'}`, 
        type: "Blog", 
        reason: "Direct comparison queries are leading to competitor pages.", 
        difficulty: "Easy" 
      }
    ],

    citationOpportunities: [
      { 
        site: "techcrunch.com", 
        relevance: "High", 
        contactGuess: "editor@techcrunch.com", 
        pitchAngle: "New AI Feature Launch", 
        missing: true 
      },
      { 
        site: "saas-insider.com", 
        relevance: "Medium", 
        contactGuess: "hello@saas-insider.com", 
        pitchAngle: "Founder Story / Growth Journey", 
        missing: true 
      }
    ],
    
    promptsGenerated: prompts
  };
};

export const generateContentDraft = async (topic: string, type: string, brand: string, tone: ContentTone): Promise<string> => {
  await wait(1000);
  return `
# ${topic}
**Type:** ${type} | **Tone:** ${tone}

## Executive Summary
This content is designed to rank for high-intent GEO queries. It positions ${brand} as the thought leader.

## Key Talking Points
- Point 1: Why current solutions fail.
- Point 2: How ${brand} solves this uniquely.
- Point 3: Data-backed evidence.

## Draft Intro
In today's fast-paced ${type} landscape, finding the right solution is critical. Many users struggle with legacy tools...
  `.trim();
};

export const generateEmailPitch = async (site: string, contact: string, angle: string, brand: string, tone: ContentTone): Promise<string> => {
  await wait(1000);
  return `
Subject: Quick question re: ${angle} for ${site}

Hi ${contact.split('@')[0] || 'Editor'},

I noticed ${site} hasn't covered the latest shifts in our industry yet. 

At ${brand}, we just released data showing...

Would you be open to a guest post or a quick chat?

Best,
[Your Name]
  `.trim();
};