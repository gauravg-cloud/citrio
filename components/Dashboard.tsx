
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine, CartesianGrid
} from 'recharts';
import { AnalysisReport, BrandProfile, GeneratedPrompt } from '../types';
import { ICONS, COLORS } from '../constants';
import Recommendations from './Recommendations';

interface Props {
  report: AnalysisReport;
  profile: BrandProfile;
  onReset: () => void;
}

const Dashboard: React.FC<Props> = ({ report, profile, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sov' | 'citations' | 'recommendations' | 'prompts'>('overview');
  const [citationFilter, setCitationFilter] = useState<'all' | 'missing' | 'high-auth'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topicRadarData = report.topicScores.map(t => ({
    topic: t.topic,
    You: t.brandScore,
    Competitors: t.competitorAvg
  }));

  const filteredCitations = report.citations.filter(c => {
    if (citationFilter === 'missing') return !c.mentioned;
    if (citationFilter === 'high-auth') return c.domainAuthority === 'High';
    return true;
  });

  const getTopicPrompts = (topicName: string) => {
    return report.promptsGenerated
      .filter(p => p.topic === topicName)
      .map((p, i) => ({
         ...p,
         rank: Math.floor(Math.random() * 5) + (report.topicScores.find(t => t.topic === topicName)?.brandScore || 50) > 70 ? 1 : 3
      }));
  };

  // Transformation for SOV Charts
  const sovTrendData = report.shareOfVoice[0].trend.map((_, index) => {
    const obj: any = { month: `M${index + 1}` };
    report.shareOfVoice.forEach(sov => {
       obj[sov.brand] = sov.trend[index];
    });
    return obj;
  });

  const sovMatrixData = report.shareOfVoice.map(sov => ({
    name: sov.brand,
    mentions: sov.mentions, // X Axis
    sentiment: sov.sentiment, // Y Axis
    score: sov.score, // Z Axis (size)
    isYou: sov.brand === profile.name
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md bg-opacity-95">
          <p className="font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
              <span className="text-slate-500">{p.name}:</span>
              <span className="font-mono font-bold text-slate-900">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 md:h-screen z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-citrio-yellow rounded-lg flex items-center justify-center text-lg shadow-md shadow-orange-100">🍋</div>
          <div>
            <span className="font-bold text-lg text-slate-900 block leading-none">Citrio</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Enterprise</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: ICONS.Dashboard },
            { id: 'sov', label: 'Share of Voice', icon: ICONS.Chart },
            { id: 'citations', label: 'Citations', icon: ICONS.Globe },
            { id: 'recommendations', label: 'Recommendations', icon: ICONS.Zap },
            { id: 'prompts', label: 'Prompt Data', icon: ICONS.Search },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border border-transparent
                ${activeTab === item.id 
                  ? 'bg-citrio-dark text-white shadow-lg shadow-slate-900/10 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium">System Status</span>
             </div>
             <p className="text-xs text-slate-400">Scanning 5 Engines</p>
          </div>
          <button onClick={onReset} className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs transition-colors">
            {ICONS.Plus} New Project
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative bg-slate-50">
        <header className="mb-8 flex justify-between items-end">
           <div>
             <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <span className="font-semibold text-slate-900">{profile.name}</span>
                <span>/</span>
                <span>{new Date().toLocaleDateString()}</span>
             </div>
             <h1 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
           </div>
           <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
              {ICONS.Download} Export PDF
           </button>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
             {/* Key Metrics */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-citrio-yellow/50 transition-colors shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-citrio-dark">{ICONS.Trend}</div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">Brand Visibility</p>
                <h3 className="text-4xl font-bold text-slate-900">{report.overallScore}<span className="text-lg text-slate-400">/100</span></h3>
                <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-citrio-brandLight shadow-md" style={{ width: `${report.overallScore}%` }}></div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">Content Gaps</p>
                <h3 className="text-4xl font-bold text-slate-900">{report.contentGaps.length}</h3>
                <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">{ICONS.Alert} Critical topics missing</p>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">Citations Found</p>
                <h3 className="text-4xl font-bold text-slate-900">{report.citations.filter(c => c.mentioned).length}</h3>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">{ICONS.CheckGreen} Across {report.citations.length} sources</p>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50 shadow-sm">
                <button onClick={() => setActiveTab('recommendations')} className="bg-citrio-dark text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transform hover:scale-[1.02]">
                   View Action Plan {ICONS.ArrowRight}
                </button>
             </div>

             {/* Topic Analysis Grid */}
             <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">Topic Authority Comparison</h3>
                  <div className="text-xs text-slate-500 flex gap-4">
                     <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 bg-citrio-brandLight rounded-full border border-slate-200"></span> You</span>
                     <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span> Competitors</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={110} data={topicRadarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="You" dataKey="You" stroke={COLORS.brandLight} strokeWidth={3} fill={COLORS.brandLight} fillOpacity={0.6} />
                        <Radar name="Competitors" dataKey="Competitors" stroke={COLORS.competitor} strokeWidth={2} fill={COLORS.competitor} fillOpacity={0.2} />
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Topic List Drilldown */}
                  <div className="w-full md:w-64 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Drill Down</p>
                     {report.topicScores.map((t, i) => (
                        <button 
                           key={i} 
                           onClick={() => setSelectedTopic(t.topic)}
                           className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 transition-all flex justify-between items-center group text-left"
                        >
                           <span className="text-sm text-slate-600 group-hover:text-slate-900 truncate flex-1 font-medium">{t.topic}</span>
                           <span className={`text-xs font-mono font-bold ${t.brandScore > t.competitorAvg ? 'text-green-600' : 'text-rose-500'}`}>
                              {t.brandScore}%
                           </span>
                           <span className="opacity-0 group-hover:opacity-100 text-slate-400 ml-2">{ICONS.Maximize}</span>
                        </button>
                     ))}
                  </div>
                </div>
             </div>

             {/* Engine Breakdown */}
             <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">AI Engine Visibility</h3>
                <div className="space-y-6">
                   {report.engineBreakdown.map((eng, idx) => (
                      <div key={idx} className="group cursor-default">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900 transition-colors">{eng.engine}</span>
                            <span className="text-sm font-bold text-slate-900">{eng.visibility}%</span>
                         </div>
                         <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${eng.visibility > 70 ? 'bg-citrio-accent' : eng.visibility > 40 ? 'bg-citrio-brandLight' : 'bg-slate-300'}`} 
                              style={{ width: `${eng.visibility}%` }}
                            ></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Share of Voice */}
        {activeTab === 'sov' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left Column: Visualizations */}
              <div className="lg:col-span-2 space-y-6">
                 
                 {/* 1. Visibility Trend (Area Chart) */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-slate-900 text-lg">Historical Visibility Trend</h3>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-citrio-brandLight"></span> You
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span> Competitors
                       </div>
                    </div>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sovTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLORS.brandLight} stopOpacity={0.8}/>
                                   <stop offset="95%" stopColor={COLORS.brandLight} stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                             <Tooltip content={<CustomTooltip />} />
                             <CartesianGrid vertical={false} stroke="#f1f5f9" />
                             {report.shareOfVoice.map((sov, idx) => (
                                <Area 
                                   key={sov.brand}
                                   type="monotone" 
                                   dataKey={sov.brand} 
                                   stroke={sov.brand === profile.name ? COLORS.brandLight : '#cbd5e1'} 
                                   fill={sov.brand === profile.name ? 'url(#colorYou)' : 'transparent'} 
                                   strokeWidth={sov.brand === profile.name ? 3 : 1}
                                   strokeDasharray={sov.brand === profile.name ? '' : '5 5'}
                                />
                             ))}
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* 2. Sentiment Matrix (Scatter Plot) */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="mb-4">
                       <h3 className="font-bold text-slate-900 text-lg">Sentiment vs. Frequency Matrix</h3>
                       <p className="text-xs text-slate-500">
                          Analyze quality of mentions versus quantity. 
                          <span className="font-bold text-green-600"> Top Right</span> = Best Position.
                       </p>
                    </div>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                             <CartesianGrid stroke="#f1f5f9" />
                             <XAxis type="number" dataKey="mentions" name="Mentions" unit="" tick={{fill: '#94a3b8'}} label={{ value: 'Volume of Mentions', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }} />
                             <YAxis type="number" dataKey="sentiment" name="Sentiment" unit="" domain={[-1, 1]} tick={{fill: '#94a3b8'}} label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                             <ZAxis type="number" dataKey="score" range={[100, 500]} name="Score" />
                             <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                             <ReferenceLine y={0} stroke="#e2e8f0" />
                             <ReferenceLine x={100} stroke="#e2e8f0" />
                             <Scatter name="Brands" data={sovMatrixData} fill="#8884d8">
                                {sovMatrixData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.isYou ? COLORS.brandLight : COLORS.competitor} />
                                ))}
                             </Scatter>
                          </ScatterChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Right Column: Detailed Stats & Insights */}
              <div className="space-y-6">
                 {/* Stats Table */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                       <h3 className="font-bold text-slate-900">Market Share Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="bg-white">
                             <tr>
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Brand</th>
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase text-right">Win Rate</th>
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase text-right">Sent.</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {report.shareOfVoice.map((sov, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50 ${sov.brand === profile.name ? 'bg-citrio-brandLight/5' : ''}`}>
                                   <td className="p-3">
                                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                         {idx + 1}. {sov.brand}
                                         {sov.brand === profile.name && <span className="w-2 h-2 rounded-full bg-citrio-brandLight"></span>}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-0.5">{sov.mentions} mentions</div>
                                   </td>
                                   <td className="p-3 text-right">
                                      <div className="text-sm font-mono font-bold text-slate-700">{sov.winRate}%</div>
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                         <div className="bg-green-500 h-full rounded-full" style={{ width: `${sov.winRate}%` }}></div>
                                      </div>
                                   </td>
                                   <td className="p-3 text-right">
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${sov.sentiment > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                         {sov.sentiment > 0 ? '+' : ''}{sov.sentiment}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Insights Panel */}
                 <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">{ICONS.Bot}</div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                       {ICONS.Sparkles} Strategic Insight
                    </h3>
                    <div className="space-y-4 text-sm text-slate-300">
                       <p>
                          <strong className="text-citrio-brandLight block mb-1">Dominance Alert</strong>
                          You are winning {report.shareOfVoice[0].winRate}% of head-to-head comparisons against {report.shareOfVoice[1]?.brand}. Double down on "Feature Comparison" pages.
                       </p>
                       <div className="h-px bg-slate-700"></div>
                       <p>
                          <strong className="text-rose-400 block mb-1">Negative Sentiment Risk</strong>
                          Competitor {report.shareOfVoice.find(s => s.sentiment < 0.2 && s.brand !== profile.name)?.brand || "Competitor X"} has low sentiment. Create a "Switch from X" campaign targeting their dissatisfied users.
                       </p>
                    </div>
                    <button onClick={() => setActiveTab('recommendations')} className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-citrio-brandLight transition-colors">
                       View Action Plan
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Citations */}
        {activeTab === 'citations' && (
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col min-h-[600px] shadow-sm">
              <div className="p-4 border-b border-slate-200 flex gap-2 overflow-x-auto bg-slate-50/50">
                 <button 
                   onClick={() => setCitationFilter('all')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${citationFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
                 >
                   All Sources
                 </button>
                 <button 
                   onClick={() => setCitationFilter('missing')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${citationFilter === 'missing' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
                 >
                   Missing Only
                 </button>
                 <button 
                   onClick={() => setCitationFilter('high-auth')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${citationFilter === 'high-auth' ? 'bg-green-50 text-green-600 border border-green-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
                 >
                   High Authority
                 </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Source</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Authority</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Mentions</th>
                         <th className="p-4 w-10"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredCitations.map((cite, idx) => (
                         <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 font-medium text-slate-900">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${cite.mentioned ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-500'}`}>
                                     {cite.source.charAt(0).toUpperCase()}
                                  </div>
                                  <a href={cite.url} target="_blank" rel="noreferrer" className="hover:text-citrio-brandLight hover:underline decoration-citrio-brandLight">
                                     {cite.source}
                                  </a>
                               </div>
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-full text-[10px] border font-bold ${
                                  cite.domainAuthority === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  cite.domainAuthority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-slate-100 text-slate-500 border-slate-200'
                               }`}>
                                  {cite.domainAuthority}
                               </span>
                            </td>
                            <td className="p-4">
                               {cite.mentioned ? (
                                  <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium bg-green-50 px-2 py-1 rounded w-fit border border-green-100">
                                     {ICONS.CheckGreen} Found
                                  </span>
                               ) : (
                                  <span className="flex items-center gap-1.5 text-rose-500 text-sm font-medium bg-rose-50 px-2 py-1 rounded w-fit border border-rose-100">
                                     {ICONS.X} Missing
                                  </span>
                               )}
                            </td>
                            <td className="p-4 text-slate-600 text-sm font-mono text-right font-bold">{cite.count}</td>
                            <td className="p-4 text-slate-400 hover:text-slate-900 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                               {ICONS.External}
                            </td>
                         </tr>
                      ))}
                      {filteredCitations.length === 0 && (
                        <tr>
                           <td colSpan={5} className="p-8 text-center text-slate-500">
                              No citations found for this filter.
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
           <Recommendations report={report} profile={profile} />
        )}
        
        {/* Prompts Data */}
        {activeTab === 'prompts' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Raw Prompt Data</h3>
                <div className="grid gap-3">
                    {report.promptsGenerated.map((p, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4 group hover:border-slate-300 transition-colors">
                            <span className="text-slate-400 font-mono text-sm opacity-50 font-bold">#{i+1}</span>
                            <div className="flex-1">
                                <p className="text-sm text-slate-700 font-mono mb-2 group-hover:text-slate-900 transition-colors">{p.text}</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-white px-2 py-1 rounded text-slate-500 border border-slate-200 font-medium">{p.topic}</span>
                                    <span className="text-[10px] bg-white px-2 py-1 rounded text-slate-500 border border-slate-200 font-medium">{p.intent}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Topic Detail Modal Overlay */}
        {selectedTopic && (
           <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedTopic(null)}>
              <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                 <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                       <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Topic Deep Dive</span>
                       <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedTopic}</h3>
                    </div>
                    <button onClick={() => setSelectedTopic(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                       {ICONS.Close}
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                    <p className="text-sm text-slate-500 mb-4">
                       Here are the specific prompts generated for this topic and how your brand is likely to rank based on our simulation.
                    </p>
                    {getTopicPrompts(selectedTopic).map((p, i) => (
                       <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <p className="text-sm text-slate-800 font-mono mb-3 font-medium">"{p.text}"</p>
                          <div className="flex items-center gap-4">
                             <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${
                                p.rank === 1 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-200 text-slate-500'
                             }`}>
                                {p.rank === 1 ? ICONS.CheckGreen : ICONS.X} Rank #{p.rank}
                             </div>
                             <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Intent: {p.intent}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
