import React, { useState } from 'react';
import { Topic } from '../types';
import { ICONS } from '../constants';

interface Props {
  topics: Topic[];
  onNext: (selectedTopics: Topic[]) => void;
  isLoading: boolean;
}

const TopicStep: React.FC<Props> = ({ topics: initialTopics, onNext, isLoading }) => {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [customTopic, setCustomTopic] = useState('');

  const toggleTopic = (id: string) => {
    setTopics(topics.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const addCustomTopic = () => {
    if (customTopic.trim()) {
      const newTopic: Topic = {
        id: `custom-${Date.now()}`,
        name: customTopic.trim(),
        justification: 'Added manually by user',
        selected: true
      };
      setTopics([...topics, newTopic]);
      setCustomTopic('');
    }
  };

  const selectedCount = topics.filter(t => t.selected).length;
  const totalPrompts = selectedCount * 50;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 animate-fade-in w-full">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          Topic Discovery
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
          Citrio has identified these high-intent categories based on your website content and competitive landscape. Select the topics you want to audit.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Col: Topic Grid */}
        <div className="flex-1 w-full space-y-6">
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`
                  cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden
                  ${topic.selected 
                    ? 'bg-white border-citrio-dark shadow-lg shadow-slate-200' 
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                  }
                `}
              >
                {/* Visual Status Indicator Strip */}
                {topic.selected && (
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-citrio-dark"></div>
                )}

                <div className="flex items-center gap-5 pl-2">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      topic.selected ? 'bg-citrio-yellow/20 text-slate-900' : 'bg-slate-100 text-slate-400'
                   }`}>
                      {index % 3 === 0 ? ICONS.Zap : index % 3 === 1 ? ICONS.BarChart : ICONS.Layers}
                   </div>
                   
                   <div>
                      <h3 className={`font-bold text-lg mb-1 ${topic.selected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {topic.name}
                      </h3>
                      {topic.justification && (
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                             Detected Signal
                           </span>
                           <span className="text-sm text-slate-500 line-clamp-1">
                             {topic.justification}
                           </span>
                        </div>
                      )}
                   </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Mock Relevance Score */}
                  <div className="hidden md:flex flex-col items-end gap-1">
                     <span className="text-[10px] uppercase font-bold text-slate-400">Relevance</span>
                     <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                           <div key={i} className={`w-1.5 h-4 rounded-full ${i <= 3 ? 'bg-citrio-green' : 'bg-slate-200'}`}></div>
                        ))}
                     </div>
                  </div>

                  {/* Improved Checkbox / Toggle */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border-2
                    ${topic.selected 
                      ? 'bg-citrio-dark border-citrio-dark scale-110' 
                      : 'bg-transparent border-slate-300 group-hover:border-slate-400'
                    }
                  `}>
                     {topic.selected && ICONS.Check}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Topic Input */}
          <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 flex gap-2 shadow-inner">
            <div className="pl-4 flex items-center justify-center text-slate-400">
               {ICONS.Plus}
            </div>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
              placeholder="Add a custom topic (e.g. 'Enterprise Security Features')..."
              className="flex-1 bg-transparent px-2 py-3 text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
            <button
              onClick={addCustomTopic}
              disabled={!customTopic}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Right Col: Preview Panel */}
        <div className="w-full lg:w-96 sticky top-8">
           <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 bg-citrio-yellow rounded-xl flex items-center justify-center shadow-md shadow-orange-100">
                    <span className="text-xl">📊</span>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">Scan Scope</h3>
                    <p className="text-xs text-slate-500">Configuration Preview</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">Topics Selected</span>
                    <span className="text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                       {selectedCount}
                    </span>
                 </div>

                 <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">Est. Prompts</span>
                    <span className="text-lg font-bold text-citrio-dark">
                       ~{totalPrompts}
                    </span>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wide">
                       <span>Coverage Balance</span>
                       <span>Good</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                       <div className="h-full bg-blue-400 w-[30%]"></div>
                       <div className="h-full bg-purple-400 w-[40%]"></div>
                       <div className="h-full bg-citrio-green w-[30%]"></div>
                    </div>
                    <div className="flex gap-3 pt-1">
                       <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Info</span>
                       <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Comp</span>
                       <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-citrio-green"></span> Comm</span>
                    </div>
                 </div>
              </div>

              <button
                onClick={() => onNext(topics)}
                disabled={isLoading || selectedCount === 0}
                className="w-full mt-8 bg-citrio-dark hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    {ICONS.Loading} Designing...
                  </>
                ) : (
                  <>
                    Generate Prompt Set {ICONS.ArrowRight}
                  </>
                )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default TopicStep;