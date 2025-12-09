import React from 'react';
import { ICONS } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md space-y-8 text-center relative">
        
        {/* Animated Lemon Loader */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-citrio-yellow rounded-full animate-spin shadow-[0_0_20px_rgba(245,158,11,0.3)]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
            🍋
          </div>
        </div>

        <div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Brand Visibility</h2>
           <p className="text-slate-500 text-sm">Citrio is querying AI engines and collecting citations.</p>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex justify-center gap-4">
           {['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot'].map((engine, i) => (
             <div key={engine} className="flex flex-col items-center gap-2" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 animate-[pulse_1.5s_infinite]">
                   {ICONS.Bot}
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{engine}</span>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-lg p-4 text-xs text-slate-500 font-mono border border-slate-200 shadow-sm">
           <p className="animate-pulse">_ querying vector databases...</p>
           <p className="animate-pulse delay-75">_ analyzing sentiment patterns...</p>
           <p className="animate-pulse delay-150">_ extracting domain authority...</p>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;