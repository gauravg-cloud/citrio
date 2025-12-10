
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
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Querying ChatGPT</h2>
           <p className="text-slate-500 text-sm">Citrio is analyzing visibility for your brand on GPT-4o.</p>
        </div>

        {/* Single Agent Status Indicator */}
        <div className="flex justify-center gap-4">
             <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 flex items-center justify-center animate-[pulse_1.5s_infinite]">
                   {ICONS.Bot}
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active</span>
             </div>
        </div>

        <div className="bg-white rounded-lg p-4 text-xs text-slate-500 font-mono border border-slate-200 shadow-sm mt-8">
           <p className="animate-pulse">_ connecting to vector database...</p>
           <p className="animate-pulse delay-75">_ analyzing semantic relevance...</p>
           <p className="animate-pulse delay-150">_ retrieving search grounding citations...</p>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;
