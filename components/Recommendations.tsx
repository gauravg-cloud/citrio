import React, { useState } from 'react';
import { AnalysisReport, BrandProfile, ContentTone } from '../types';
import { generateContentDraft, generateEmailPitch } from '../services/gemini';
import { ICONS } from '../constants';

interface Props {
  report: AnalysisReport;
  profile: BrandProfile;
  onReset?: () => void;
}

const Recommendations: React.FC<Props> = ({ report, profile }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Configuration State
  const [selectedTone, setSelectedTone] = useState<ContentTone>('Professional');

  const tones: ContentTone[] = ['Professional', 'Conversational', 'Authoritative', 'Persuasive', 'Witty'];

  const handleGenerateContent = async (idx: number, gap: any) => {
    setGeneratingId(`content-${idx}`);
    try {
      const content = await generateContentDraft(gap.title, gap.type, profile.name, selectedTone);
      setGeneratedContent(content);
      setModalTitle(`Content Brief: ${gap.title}`);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateEmail = async (idx: number, opp: any) => {
    setGeneratingId(`email-${idx}`);
    try {
      const content = await generateEmailPitch(opp.site, opp.contactGuess, opp.pitchAngle, profile.name, selectedTone);
      setGeneratedContent(content);
      setModalTitle(`Outreach to ${opp.site}`);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingId(null);
    }
  };

  const closeModal = () => {
    setGeneratedContent(null);
    setModalTitle('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Configuration Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-lg shadow-slate-200/50">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-citrio-brandLight/20 rounded-lg text-orange-600">
               {ICONS.Zap}
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-sm">Recommendation Engine</h3>
               <p className="text-xs text-slate-500">Configure AI generation style</p>
            </div>
         </div>
         <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-400 ml-2 font-medium">Tone:</span>
            <div className="flex gap-1">
               {tones.map(tone => (
                  <button
                     key={tone}
                     onClick={() => setSelectedTone(tone)}
                     className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        selectedTone === tone 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                     }`}
                  >
                     {tone}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Content Gaps */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          {ICONS.File} Strategic Content Gaps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {report.contentGaps.map((gap, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:border-citrio-brandLight transition-all group hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-20 text-citrio-brandLight transition-opacity">
                 {ICONS.File}
              </div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold border border-slate-200">
                  {gap.type}
                </span>
                <span className={`text-[10px] px-2 py-1 rounded border font-bold ${
                  gap.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' : 
                  'bg-orange-50 text-orange-600 border-orange-200'
                }`}>
                  {gap.difficulty} Win
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{gap.title}</h4>
              <p className="text-sm text-slate-500 mb-6 flex-1 border-t border-slate-100 pt-3 mt-1 leading-relaxed">
                 "{gap.reason}"
              </p>
              
              <button
                onClick={() => handleGenerateContent(idx, gap)}
                disabled={!!generatingId}
                className="w-full bg-slate-900 hover:bg-citrio-brandLight hover:text-slate-900 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
              >
                {generatingId === `content-${idx}` ? ICONS.Loading : ICONS.Zap}
                Generate {selectedTone} Brief
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          {ICONS.Mail} Citation Outreach
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.citationOpportunities.map((opp, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                       {opp.site.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <h4 className="text-lg font-bold text-slate-900">{opp.site}</h4>
                       <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">{ICONS.Target} Contact: {opp.contactGuess || 'Unknown'}</span>
                    </div>
                 </div>
                 {opp.relevance === 'High' && <span className="text-[10px] font-bold text-orange-600 border border-orange-200 px-2 py-1 rounded-full h-fit bg-orange-50">HIGH IMPACT</span>}
              </div>
              <p className="text-sm text-slate-600 italic mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">{ICONS.Edit}</span>
                Pitch Angle: {opp.pitchAngle}
              </p>
              <div className="mt-auto">
                <button
                  onClick={() => handleGenerateEmail(idx, opp)}
                  disabled={!!generatingId}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                  {generatingId === `email-${idx}` ? ICONS.Loading : ICONS.Send}
                  Draft {selectedTone} Email
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {generatedContent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                 <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
                 <span className="text-xs text-citrio-dark bg-slate-200 px-2 py-0.5 rounded border border-slate-300 font-medium">{selectedTone} Tone</span>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                {ICONS.Close}
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-white custom-scrollbar">
               <div className="prose prose-slate prose-sm max-w-none font-mono text-slate-700">
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">{generatedContent}</pre>
               </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={closeModal}
                className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                }}
                className="px-5 py-2.5 bg-citrio-dark hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-colors text-sm shadow-lg shadow-slate-900/10"
              >
                {ICONS.File} Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Recommendations;