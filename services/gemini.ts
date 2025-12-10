
import { GoogleGenAI, Type } from "@google/genai";
import { BrandProfile, Topic, AnalysisReport, PromptAnalysisResult, ContentTone } from "../types";

// Helper to clean Markdown JSON
const parseJSON = (text: string) => {
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw e;
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Live Topic Suggestion ---

export const suggestTopics = async (profile: BrandProfile): Promise<Topic[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Analyze the B2B SaaS brand "${profile.name}" in the "${profile.industry}" industry.
      Competitors: ${profile.competitors.map(c => c.name).join(', ')}.
      
      Suggest 5 high-intent search topics that potential customers would use to find software in this category.
      Focus on topics like "Best [Category] Tools", "[Brand] vs [Competitor]", "Enterprise Pricing", "Integrations", etc.
      
      Return JSON format:
      [
        { "name": "Topic Name", "justification": "Why this is relevant" }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              justification: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = parseJSON(response.text || '[]');
    
    return data.map((t: any, i: number) => ({
      id: `topic-${i}`,
      name: t.name,
      justification: t.justification,
      selected: true
    }));

  } catch (error) {
    console.error("Error generating topics, falling back to basic logic:", error);
    // Fallback if API fails
    return [
      { id: 't1', name: `Best ${profile.industry} Software`, selected: true, justification: 'High volume intent' },
      { id: 't2', name: `${profile.name} vs Competitors`, selected: true, justification: 'Comparison intent' },
      { id: 't3', name: `${profile.industry} Pricing`, selected: true, justification: 'Cost analysis queries' },
      { id: 't4', name: 'Enterprise Features', selected: true, justification: 'Feature evaluation' },
      { id: 't5', name: 'Reviews & Ratings', selected: true, justification: 'Social proof queries' }
    ];
  }
};

// --- Live Prompt Generation ---

export const generatePrompts = async (profile: BrandProfile, topics: Topic[]): Promise<PromptAnalysisResult[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // We will generate prompts for selected topics using a single batch call to save time/quota
    const selectedTopics = topics.filter(t => t.selected).map(t => t.name).join(', ');
    
    const prompt = `
      Generate 3 distinct search prompts for EACH of the following topics: ${selectedTopics}.
      Context: User is looking for "${profile.industry}" software.
      Brand: ${profile.name}.
      
      For each prompt, assign an 'intent' (Comparison, Discovery, Commercial, or Informational).
      
      Return JSON:
      [
        { "topic": "Topic Name", "text": "The prompt text", "intent": "intent_category" }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              text: { type: Type.STRING },
              intent: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = parseJSON(response.text || '[]');
    
    // Map to our internal structure
    return data.map((p: any, i: number) => ({
      id: `prompt-${i}`,
      topic: p.topic,
      intent: p.intent,
      text: p.text,
      responseDate: '',
      model: 'ChatGPT-4o', // Default Label
      responseText: '',
      brandMentioned: false,
      competitorsMentioned: [],
      sentiment: 'Neutral',
      rank: null,
      citations: [],
      recommendation: ''
    }));

  } catch (error) {
    console.error("Error generating prompts:", error);
    // Fallback
    return topics.filter(t => t.selected).map((t, i) => ({
      id: `prompt-fallback-${i}`,
      topic: t.name,
      intent: 'Discovery',
      text: `What are the best tools for ${t.name}?`,
      responseDate: '',
      model: 'ChatGPT-4o',
      responseText: '',
      brandMentioned: false,
      competitorsMentioned: [],
      sentiment: 'Neutral',
      rank: null,
      citations: [],
      recommendation: ''
    }));
  }
};


// --- Live Analysis with Search Grounding ---

// Helper to determine sentiment locally
const determineSentiment = (text: string, brand: string): 'Positive' | 'Neutral' | 'Negative' => {
  const lowerText = text.toLowerCase();
  const lowerBrand = brand.toLowerCase();
  
  if (!lowerText.includes(lowerBrand)) return 'Neutral';

  // Simple heuristic for demo purposes (API based sentiment would be better but slower)
  const positiveWords = ['best', 'excellent', 'great', 'top', 'leader', 'efficient', 'robust', 'recommended', 'love', 'perfect'];
  const negativeWords = ['slow', 'expensive', 'hard', 'difficult', 'buggy', 'crash', 'bad', 'worst', 'avoid', 'lack'];

  // Extract a window around the brand name
  const idx = lowerText.indexOf(lowerBrand);
  const start = Math.max(0, idx - 100);
  const end = Math.min(lowerText.length, idx + 100);
  const window = lowerText.substring(start, end);

  let score = 0;
  positiveWords.forEach(w => { if (window.includes(w)) score++; });
  negativeWords.forEach(w => { if (window.includes(w)) score--; });

  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
};

export const analyzeGEO = async (
  profile: BrandProfile, 
  topics: Topic[], 
  prompts: PromptAnalysisResult[]
): Promise<AnalysisReport> => {
  
  const enrichedPrompts: PromptAnalysisResult[] = [];
  let ai;

  try {
     ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (e) {
     console.error("Failed to initialize AI client for analysis", e);
     throw new Error("AI Client Init Failed");
  }

  // Limit to a subset for the demo to prevent hitting API Rate Limits immediately if there are 50+ prompts.
  const promptsToRun = prompts.slice(0, 10); // Reduced batch size for single-model speed

  for (let i = 0; i < promptsToRun.length; i++) {
    const p = promptsToRun[i];
    
    try {
      // Live Call with Grounding
      // We are simulating "ChatGPT" behavior using Gemini's Search capability
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: p.text, 
        config: {
          tools: [{ googleSearch: {} }], 
          systemInstruction: `You are ChatGPT, a helpful AI assistant. Answer the user's query comprehensively based on web search results.`
        }
      });

      const responseText = response.text || "No response generated.";
      
      // Extract Citations
      const rawCitations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      // Filter and clean citations
      const citations = rawCitations
        .filter((c: any) => {
           const uri = c.web?.uri;
           const title = c.web?.title;
           if (!uri || !title) return false;
           // Filter out internal google system domains
           const isGoogleSystem = uri.includes('vertexaisearch.cloud.google.com') || 
                                  uri.includes('google.com/search') ||
                                  uri.includes('googleusercontent.com');
           return !isGoogleSystem;
        })
        .map((c: any) => ({
          source: new URL(c.web.uri).hostname.replace(/^www\./, ''),
          url: c.web.uri,
          title: c.web.title
        }));

      // Deduplicate citations based on URL
      const uniqueCitations = Array.from(new Map(citations.map((c: any) => [c.url, c])).values());

      // Analyze Results
      const brandMentioned = responseText.toLowerCase().includes(profile.name.toLowerCase());
      const sentiment = determineSentiment(responseText, profile.name);
      
      const competitorsMentioned = profile.competitors
        .filter(c => responseText.toLowerCase().includes(c.name.toLowerCase()))
        .map(c => c.name);

      // Determine Rank
      let rank: number | null = null;
      if (brandMentioned && (p.intent === 'Commercial' || p.intent === 'Discovery')) {
         const idx = responseText.toLowerCase().indexOf(profile.name.toLowerCase());
         rank = Math.min(5, Math.floor(idx / 200) + 1); 
      }

      // Recommendation Logic
      let recommendation = "";
      if (brandMentioned) {
          if (sentiment === 'Negative') recommendation = "Address negative sentiment found in search results.";
          else if (!uniqueCitations.some((c: any) => c.url.includes(profile.website))) recommendation = "You are mentioned but not directly cited. Improve Schema markup.";
          else recommendation = "Strong visibility. Reinforce with a comparison page.";
      } else {
          recommendation = "Missing from search results. Create content targeting this specific query.";
      }

      enrichedPrompts.push({
        ...p,
        responseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        model: 'ChatGPT-4o', // Hardcoded label for single-model view
        responseText,
        brandMentioned,
        competitorsMentioned,
        sentiment,
        rank,
        citations: uniqueCitations as any[],
        recommendation
      });

      await wait(500);

    } catch (err) {
      console.error(`Error analyzing prompt ${p.id}:`, err);
      // Push a failed state
      enrichedPrompts.push({
        ...p,
        responseDate: new Date().toLocaleDateString(),
        model: 'ChatGPT-4o',
        responseText: "Analysis failed due to search timeout.",
        brandMentioned: false,
        competitorsMentioned: [],
        sentiment: 'Neutral',
        rank: null,
        citations: [],
        recommendation: "Retry analysis."
      });
    }
  }

  // -----------------------------------------------------
  // AGGREGATION LOGIC (Simplified for Single Model)
  // -----------------------------------------------------

  const totalPrompts = enrichedPrompts.length;
  const brandMentionsCount = enrichedPrompts.filter(p => p.brandMentioned).length;
  const brandScore = totalPrompts > 0 ? Math.round((brandMentionsCount / totalPrompts) * 100) : 0;
  
  const brandPositive = enrichedPrompts.filter(p => p.brandMentioned && p.sentiment === 'Positive').length;
  const brandNegative = enrichedPrompts.filter(p => p.brandMentioned && p.sentiment === 'Negative').length;
  
  const brandSentimentScore = brandMentionsCount > 0 
    ? Number(((brandPositive - brandNegative) / brandMentionsCount).toFixed(2)) 
    : 0;

  const sovData = [
    {
      brand: profile.name,
      score: brandScore,
      sentiment: brandSentimentScore,
      mentions: brandMentionsCount,
      trend: [brandScore, brandScore, brandScore, brandScore, brandScore, brandScore], 
      positiveMentions: brandPositive,
      negativeMentions: brandNegative,
      winRate: 0 
    },
    ...profile.competitors.map(comp => {
      const mentions = enrichedPrompts.filter(p => p.competitorsMentioned.includes(comp.name)).length;
      const score = totalPrompts > 0 ? Math.round((mentions / totalPrompts) * 100) : 0;
      
      const headToHeadPrompts = enrichedPrompts.filter(p => p.competitorsMentioned.includes(comp.name));
      const wins = headToHeadPrompts.filter(p => p.brandMentioned).length; 
      const winRate = headToHeadPrompts.length > 0 ? Math.round((wins / headToHeadPrompts.length) * 100) : 0;

      return {
        brand: comp.name,
        score,
        sentiment: 0, 
        mentions,
        trend: [score, score, score, score, score, score],
        positiveMentions: 0,
        negativeMentions: 0,
        winRate: 100 - winRate 
      };
    })
  ].sort((a, b) => b.score - a.score);

  if (sovData.length > 1) {
    sovData[0].winRate = Math.round(sovData.slice(1).reduce((acc, curr) => acc + (100 - curr.winRate), 0) / Math.max(1, sovData.length - 1));
  }

  // Topic Scores
  const topicStats = topics.filter(t => t.selected).map(t => {
    const topicPrompts = enrichedPrompts.filter(p => p.topic === t.name);
    const brandMentions = topicPrompts.filter(p => p.brandMentioned).length;
    const brandScore = topicPrompts.length > 0 ? Math.round((brandMentions / topicPrompts.length) * 100) : 0;
    
    let compMentionsSum = 0;
    profile.competitors.forEach(c => {
       compMentionsSum += topicPrompts.filter(p => p.competitorsMentioned.includes(c.name)).length;
    });
    const avgCompMentions = profile.competitors.length > 0 ? compMentionsSum / profile.competitors.length : 0;
    const compScore = topicPrompts.length > 0 ? Math.round((avgCompMentions / topicPrompts.length) * 100) : 0;

    return {
      topic: t.name,
      brandScore,
      competitorAvg: compScore
    };
  });

  // Citations Aggregation
  const citationMap = new Map<string, { count: number; brandMentionedCount: number; url: string; auth: string }>();

  enrichedPrompts.forEach(p => {
    p.citations.forEach(c => {
      // Key by source domain to aggregate count
      const existing = citationMap.get(c.source) || { count: 0, brandMentionedCount: 0, url: c.url, auth: 'Medium' };
      existing.count += 1;
      if (p.brandMentioned) {
        existing.brandMentionedCount += 1;
      }
      
      // Determine Auth
      const highAuth = ['g2.com', 'capterra.com', 'forbes.com', 'techcrunch.com', 'linkedin.com', 'reddit.com'];
      if (highAuth.some(d => c.source.includes(d))) existing.auth = 'High';
      
      existing.url = c.url; // Keep latest
      citationMap.set(c.source, existing);
    });
  });

  const citationReport = Array.from(citationMap.entries()).map(([source, data]) => ({
    source,
    domainAuthority: data.auth as 'High' | 'Medium' | 'Low',
    mentioned: data.brandMentionedCount > 0,
    url: data.url,
    count: data.count
  })).sort((a, b) => b.count - a.count);

  // Gaps & Opps
  const contentGaps = topicStats
    .filter(t => t.brandScore < t.competitorAvg)
    .map(t => ({
      title: `Improve Ranking for: ${t.topic}`,
      type: 'Comparison',
      reason: `Competitors are appearing in ${(t.competitorAvg - t.brandScore).toFixed(0)}% more results.`,
      difficulty: 'Medium' as const
    })).slice(0, 3);

  const citationOpportunities = citationReport
    .filter(c => !c.mentioned)
    .map(c => ({
      site: c.source,
      relevance: (c.domainAuthority === 'High' ? 'High' : 'Medium') as 'High' | 'Medium',
      contactGuess: `editorial@${c.source}`,
      pitchAngle: 'Include in Best-of List',
      missing: true
    })).slice(0, 4);

  return {
    overallScore: brandScore,
    shareOfVoice: sovData,
    topicScores: topicStats,
    citations: citationReport,
    contentGaps,
    citationOpportunities,
    promptsGenerated: enrichedPrompts
  };
};

export const generateContentDraft = async (topic: string, type: string, brand: string, tone: ContentTone): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a ${tone} content brief for "${brand}" about "${topic}". Type: ${type}. Include an outline and introductory paragraph.`
    });
    return response.text || "Failed to generate content.";
  } catch (e) {
    return "Error connecting to AI generation service.";
  }
};

export const generateEmailPitch = async (site: string, contact: string, angle: string, brand: string, tone: ContentTone): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a ${tone} email pitch to ${site} (Contact: ${contact}). Brand: ${brand}. Angle: ${angle}. Keep it short.`
    });
    return response.text || "Failed to generate email.";
  } catch (e) {
    return "Error connecting to AI generation service.";
  }
};
