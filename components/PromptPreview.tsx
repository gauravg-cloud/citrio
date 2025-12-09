import React, { useState } from 'react';
import { GeneratedPrompt } from '../types';
import { ICONS } from '../constants';

interface Props {
  prompts: GeneratedPrompt[];
  onNext: () => void;
  isLoading: boolean;
}

const PromptPreview: React.FC<Props> = ({ prompts: initialPrompts, onNext, isLoading }) => {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const topics = ['All', ...Array.from(new Set(prompts.map(p => p.topic)))];
  const filteredPrompts = filterTopic === 'All' ? prompts : prompts.filter(p => p.topic === filterTopic);

  const startEdit = (prompt: GeneratedPrompt) => {
    setEditingId(prompt.id);
    setEditValue(prompt.text);
  };

  const saveEdit = (id: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, text: editValue, isEdited: true } : p));
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-fade-in h-screen flex flex-col bg-slate-50">
      <div className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 mb-2">Prompt Set Preview</h2>
           <p className="text-slate-500">
             Review and fine-tune the {prompts.length} prompts Citrio will use to audit your brand.
           </p>
        </div>
        <div className="text-right">
           <div className="text-3xl font-mono font-bold text-citrio-dark">{(prompts.length * 5).toLocaleString()}</div>
           <div className="text-xs text-slate-400 uppercase tracking-widest">Total Queries</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setFilterTopic(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              filterTopic === t 
              ? 'bg-citrio-dark text-white border-citrio-dark' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-1 mb-6 shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
               <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase border-b border-slate-200">Prompt Text</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase w-32 border-b border-slate-200">Topic</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase w-32 border-b border-slate-200">Intent</th>
                  <th className="p-4 w-10 border-b border-slate-200"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredPrompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="p-4">
                        {editingId === prompt.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-citrio-dark focus:ring-1 focus:ring-citrio-dark"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(prompt.id)}
                            />
                            <button onClick={() => saveEdit(prompt.id)} className="text-citrio-green hover:text-green-600 p-2">
                              {ICONS.Check}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                             <span className="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 cursor-text" onClick={() => startEdit(prompt)}>
                                {prompt.text}
                             </span>
                             {prompt.isEdited && (
                               <span className="text-[10px] text-orange-600 bg-orange-50 px-1 rounded border border-orange-100">edited</span>
                             )}
                          </div>
                        )}
                     </td>
                     <td className="p-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                           {prompt.topic}
                        </span>
                     </td>
                     <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${
                           prompt.intent === 'Commercial' ? 'bg-green-50 text-green-700 border-green-100' :
                           prompt.intent === 'Comparison' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                           'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                           {prompt.intent}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        {!editingId && (
                           <button onClick={() => startEdit(prompt)} className="text-slate-400 hover:text-citrio-dark transition-colors opacity-0 group-hover:opacity-100">
                              {ICONS.Edit}
                           </button>
                        )}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full bg-citrio-dark hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/10 transition-all flex justify-center items-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5"
      >
        {isLoading ? (
           <>
             {ICONS.Loading} Running Multi-Agent Simulation...
           </>
        ) : (
           <>
             Run Analysis (5 Engines) {ICONS.Zap}
           </>
        )}
      </button>
    </div>
  );
};

export default PromptPreview;