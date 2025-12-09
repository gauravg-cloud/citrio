import React, { useState } from 'react';
import { BrandProfile, Competitor } from '../types';
import { ICONS } from '../constants';

interface Props {
  onNext: (profile: BrandProfile) => void;
  isLoading: boolean;
}

const InputStep: React.FC<Props> = ({ onNext, isLoading }) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: '', website: '' }
  ]);

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, { name: '', website: '' }]);
    }
  };

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const newComps = [...competitors];
    newComps[index][field] = value;
    setCompetitors(newComps);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCompetitors = competitors.filter(c => c.name && c.website);
    onNext({ name, website, industry, competitors: validCompetitors });
  };

  const getFavicon = (url: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const filledCompetitorsCount = competitors.filter(c => c.name).length;
  const totalPrompts = (filledCompetitorsCount + 1) * 50;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden text-slate-800">
      
      {/* Navbar / Branding */}
      <header className="w-full px-6 py-5 md:px-12 flex items-center justify-between z-20 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0">
        <div className="flex items-center gap-2.5">
           <div className="w-10 h-10 bg-citrio-yellow rounded-xl flex items-center justify-center shadow-md shadow-orange-100">
              <span className="text-xl">🍋</span>
           </div>
           <div>
             <span className="font-bold text-xl tracking-tight text-slate-900 block leading-none">Citrio</span>
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Visibility Engine</span>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
           <span className="text-citrio-dark font-bold">1. Configure</span>
           <span className="opacity-50">2. Topics</span>
           <span className="opacity-50">3. Preview</span>
           <span className="opacity-50">4. Analysis</span>
        </div>
      </header>

      <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row p-6 md:p-12 gap-12 lg:gap-24 items-start">
        
        {/* Left Panel: Configuration Form */}
        <div className="w-full lg:w-7/12 animate-slide-up">
          <div className="mb-8">
             <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
               Configure Scan
             </h1>
             <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
               Enter your brand details to initialize the GEO agents. We'll generate a custom knowledge graph for your industry.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Brand Identity */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Details</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase">Brand Name</label>
                    <div className="relative">
                       <input
                         required
                         type="text"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-citrio-dark focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-sm pl-11"
                         placeholder="e.g. Acme Corp"
                       />
                       <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {website && getFavicon(website) ? (
                            <img src={getFavicon(website)!} alt="icon" className="w-5 h-5 rounded-sm" />
                          ) : (
                            <div className="text-slate-300">{ICONS.Target}</div>
                          )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase">Website URL</label>
                    <div className="relative">
                       <input
                         required
                         type="url"
                         value={website}
                         onChange={(e) => setWebsite(e.target.value)}
                         className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-citrio-dark focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-sm"
                         placeholder="https://acme.com"
                       />
                    </div>
                  </div>
               </div>

               <div className="group">
                  <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase">Industry / Niche</label>
                  <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {ICONS.Search}
                     </div>
                     <input
                       required
                       type="text"
                       value={industry}
                       onChange={(e) => setIndustry(e.target.value)}
                       className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-citrio-dark focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-sm"
                       placeholder="e.g. B2B Marketing Automation, HR Tech"
                     />
                  </div>
               </div>
            </div>

            {/* Section 2: Competitive Landscape */}
            <div className="space-y-5 pt-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Competitors (Max 5)</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
               </div>

               <div className="space-y-3">
                  {competitors.map((comp, idx) => (
                    <div key={idx} className="flex gap-3 items-start group/row animate-fade-in">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Competitor Name"
                          value={comp.name}
                          onChange={(e) => updateCompetitor(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all pl-10"
                          required={idx === 0}
                        />
                        <div className="absolute left-3 top-3">
                           {comp.website && getFavicon(comp.website) ? (
                              <img src={getFavicon(comp.website)!} alt="icon" className="w-4 h-4 rounded-sm opacity-80" />
                           ) : (
                              <div className="text-slate-300 scale-75">{ICONS.Target}</div>
                           )}
                        </div>
                      </div>
                      <div className="flex-1 relative">
                         <input
                           type="url"
                           placeholder="https://competitor.com"
                           value={comp.website}
                           onChange={(e) => updateCompetitor(idx, 'website', e.target.value)}
                           className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all"
                           required={idx === 0}
                         />
                      </div>
                      {competitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompetitor(idx)}
                          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          {ICONS.Trash}
                        </button>
                      )}
                    </div>
                  ))}

                  {competitors.length < 5 && (
                    <button
                      type="button"
                      onClick={addCompetitor}
                      className="mt-2 text-xs font-bold text-slate-500 hover:text-citrio-dark flex items-center gap-2 px-1 py-2 transition-colors uppercase tracking-wide group"
                    >
                      <span className="text-lg leading-none w-5 h-5 rounded bg-slate-200 group-hover:bg-citrio-yellow flex items-center justify-center text-slate-600 group-hover:text-black transition-colors">+</span> Add Competitor
                    </button>
                  )}
               </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto md:min-w-[200px] bg-citrio-dark hover:bg-slate-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    {ICONS.Loading} Initializing...
                  </>
                ) : (
                  <>
                    Next Step {ICONS.ArrowRight}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: HUD / Preview */}
        <div className="w-full lg:w-5/12 hidden lg:block sticky top-32 animate-fade-in delay-150">
           <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-slate-200/50">
              
              <div className="relative z-10">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Analysis Scope</h3>

                 <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center group hover:border-citrio-yellow transition-colors">
                       <div>
                          <span className="text-slate-500 text-xs block mb-1">Target Brand</span>
                          <span className={`font-bold text-lg ${name ? 'text-slate-900' : 'text-slate-400'}`}>
                             {name || '---'}
                          </span>
                       </div>
                       <div className={`p-2 rounded-lg ${name ? 'bg-citrio-yellow/20 text-slate-900' : 'bg-slate-200 text-slate-400'}`}>
                          {ICONS.Target}
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center group hover:border-slate-300 transition-colors">
                       <div>
                          <span className="text-slate-500 text-xs block mb-1">Competitors Tracked</span>
                          <span className="font-bold text-lg text-slate-900">
                             {filledCompetitorsCount}
                             <span className="text-slate-400 text-sm font-normal"> / 5</span>
                          </span>
                       </div>
                       <div className="flex -space-x-2">
                          {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-2 h-8 rounded-full transform -skew-x-12 ${i < filledCompetitorsCount ? 'bg-citrio-green' : 'bg-slate-200'}`}></div>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                          <span className="text-slate-500 text-xs uppercase block mb-1">AI Engines</span>
                          <span className="text-2xl font-bold text-slate-900">5</span>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                          <span className="text-slate-500 text-xs uppercase block mb-1">Total Prompts</span>
                          <span className="text-2xl font-bold text-slate-900">~{totalPrompts}</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-start gap-3">
                       <span className="text-citrio-green mt-1 text-xs animate-pulse">●</span>
                       <div>
                          <p className="font-mono text-[10px] text-slate-400 uppercase mb-2">Live Preview</p>
                          <p className="text-sm text-slate-500 italic leading-relaxed">
                             "Citrio will crawl your industry sector to benchmark your brand against competitors on ChatGPT, Perplexity, and more."
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default InputStep;