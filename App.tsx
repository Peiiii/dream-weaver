
import React, { useState, useCallback } from 'react';
import DreamInput from './components/DreamInput';
import LoadingWeaver from './components/LoadingWeaver';
import Dreamscape from './components/Dreamscape';
import { analyzeDream, createDreamImage, createDreamAudio } from './services/geminiService';
import { DreamscapeData } from './types';

type ViewState = 'input' | 'loading' | 'scape' | 'error';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('input');
  const [dreamscapeData, setDreamscapeData] = useState<DreamscapeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for dream exploration
  const [isExploring, setIsExploring] = useState(false);
  const [explorationImageUrl, setExplorationImageUrl] = useState<string | null>(null);
  const [explorationLoadingTheme, setExplorationLoadingTheme] = useState<string | null>(null);

  const handleWeaveDream = useCallback(async (dreamText: string) => {
    setView('loading');
    setError(null);
    try {
      // Step 1: Analyze the dream to get prompts and metadata
      const analysis = await analyzeDream(dreamText);

      // Step 2: Generate image and audio in parallel
      const [imageUrl, audioBuffer] = await Promise.all([
        createDreamImage(analysis.visual_prompt),
        createDreamAudio(analysis.audio_prompt)
      ]);

      setDreamscapeData({
        analysis,
        imageUrl,
        audioBuffer,
        originalText: dreamText,
      });

      setView('scape');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to weave your dream. ${errorMessage}`);
      setView('error');
    }
  }, []);
  
  const handleExploreTheme = useCallback(async (theme: string) => {
    if (!dreamscapeData) return;

    setExplorationLoadingTheme(theme);
    setError(null);
    try {
      // Create a more specific prompt for the theme exploration
      const explorationPrompt = `A focused, detailed, close-up view exploring the theme of "${theme}". This is part of a larger dream about "${dreamscapeData.originalText}". Style: ${dreamscapeData.analysis.visual_prompt}`;
      const newImageUrl = await createDreamImage(explorationPrompt);
      
      setExplorationImageUrl(newImageUrl);
      setIsExploring(true);

    } catch(err) {
       console.error(err);
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       // Show a temporary error in the main error view, but allow returning
       setError(`Failed to explore the theme. ${errorMessage}`);
       setView('error');
    } finally {
      setExplorationLoadingTheme(null);
    }
  }, [dreamscapeData]);
  
  const handleReturnToScape = () => {
    setIsExploring(false);
    setExplorationImageUrl(null);
  };


  const handleReset = () => {
    setView('input');
    setDreamscapeData(null);
    setError(null);
    setIsExploring(false);
    setExplorationImageUrl(null);
    setExplorationLoadingTheme(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <LoadingWeaver />;
      case 'scape':
        if (dreamscapeData) {
          return (
            <Dreamscape 
              data={dreamscapeData} 
              onReset={handleReset}
              isExploring={isExploring}
              explorationImageUrl={explorationImageUrl}
              explorationLoadingTheme={explorationLoadingTheme}
              onExploreTheme={handleExploreTheme}
              onReturnToScape={handleReturnToScape}
            />
          );
        }
        // Fallback to error if data is missing
        setError("Something went wrong displaying the dreamscape.");
        return renderError();
      case 'error':
        return renderError();
      case 'input':
      default:
        return <DreamInput onSubmit={handleWeaveDream} isLoading={view === 'loading'} />;
    }
  };
  
  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-center">
        <h2 className="text-3xl text-red-400 mb-4">An Error Occurred</h2>
        <p className="text-gray-300 max-w-md mb-8">{error}</p>
        <button
            onClick={handleReset}
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors"
        >
            Try Again
        </button>
    </div>
  );

  return <div className="w-full min-h-screen bg-gray-900">{renderContent()}</div>;
};

export default App;
