import React, { useState } from 'react';
import { AppStep, BrandProfile, Topic, AnalysisReport, GeneratedPrompt } from './types';
import Welcome from './components/Welcome';
import InputStep from './components/InputStep';
import TopicStep from './components/TopicStep';
import PromptPreview from './components/PromptPreview';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import { suggestTopics, generatePrompts, analyzeGEO } from './services/gemini';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [isLoading, setIsLoading] = useState(false);
  
  // App Data State
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  // Step 1 -> 2
  const handleStart = () => {
    setStep(AppStep.INPUT);
  };

  // Step 2 -> 3
  const handleProfileSubmit = async (data: BrandProfile) => {
    setIsLoading(true);
    setProfile(data);
    try {
      const suggestedTopics = await suggestTopics(data);
      setTopics(suggestedTopics);
      setStep(AppStep.TOPIC_SELECTION);
    } catch (error) {
      console.error("Error getting topics", error);
      alert("Something went wrong initializing the analysis. Please check the console or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 -> 4
  const handleTopicsSubmit = async (selectedTopics: Topic[]) => {
    if (!profile) return;
    setIsLoading(true);
    try {
       const generated = await generatePrompts(profile, selectedTopics);
       setPrompts(generated);
       setTopics(selectedTopics); // Save the selection state
       setStep(AppStep.PROMPT_PREVIEW);
    } catch (error) {
       console.error("Error generating prompts", error);
       alert("Failed to generate prompt set.");
    } finally {
       setIsLoading(false);
    }
  };

  // Step 4 -> 5 -> 6
  const handleRunAnalysis = async () => {
    if (!profile) return;
    setIsLoading(true);
    setStep(AppStep.ANALYZING); 
    
    try {
      const analysisResults = await analyzeGEO(profile, topics, prompts);
      setReport(analysisResults);
      setStep(AppStep.DASHBOARD);
    } catch (error) {
      console.error("Error analyzing", error);
      alert("Analysis failed. Please try again.");
      setStep(AppStep.PROMPT_PREVIEW); // Go back if fail
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setProfile(null);
    setTopics([]);
    setPrompts([]);
    setReport(null);
    setStep(AppStep.WELCOME);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-citrio-yellow/50 selection:text-black">
      {step === AppStep.WELCOME && (
         <Welcome onStart={handleStart} />
      )}

      {step === AppStep.INPUT && (
        <InputStep onNext={handleProfileSubmit} isLoading={isLoading} />
      )}

      {step === AppStep.TOPIC_SELECTION && (
        <div className="min-h-screen flex flex-col pt-12">
           <TopicStep topics={topics} onNext={handleTopicsSubmit} isLoading={isLoading} />
        </div>
      )}

      {step === AppStep.PROMPT_PREVIEW && (
        <PromptPreview prompts={prompts} onNext={handleRunAnalysis} isLoading={isLoading} />
      )}

      {step === AppStep.ANALYZING && (
        <LoadingScreen />
      )}

      {step === AppStep.DASHBOARD && report && profile && (
        <Dashboard report={report} profile={profile} onReset={resetApp} />
      )}
    </div>
  );
};

export default App;