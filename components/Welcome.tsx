import React from 'react';
import { ICONS } from '../constants';

interface Props {
  onStart: () => void;
}

const Welcome: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-citrio-yellow/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 animate-fade-in relative z-10">
        
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-citrio-yellow to-orange-300 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/10 rotate-3 transition-transform hover:rotate-6 border border-white/50">
             <span className="text-5xl">🍋</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
          Citrio
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 font-medium">
          AI Search Visibility Engine for B2B SaaS
        </p>

        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          See how your brand appears inside ChatGPT, Claude, Gemini, and Perplexity. 
          Uncover competitor exposure, find hidden citations, and fix content gaps.
        </p>

        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 bg-citrio-dark text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:bg-slate-800 hover:scale-105 shadow-xl shadow-slate-900/20"
          >
            Launch Visibility Scan
            <span className="group-hover:translate-x-1 transition-transform">{ICONS.ArrowRight}</span>
          </button>
        </div>

        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-slate-400">
           <div className="flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all text-slate-900 opacity-60 hover:opacity-100">{ICONS.Bot} ChatGPT</div>
           <div className="flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all text-slate-900 opacity-60 hover:opacity-100">{ICONS.Zap} Perplexity</div>
           <div className="flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all text-slate-900 opacity-60 hover:opacity-100">{ICONS.Bot} Claude</div>
           <div className="flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all text-slate-900 opacity-60 hover:opacity-100">{ICONS.Zap} Gemini</div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;