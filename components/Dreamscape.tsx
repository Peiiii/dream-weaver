
import React, { useState, useEffect, useCallback } from 'react';
import { DreamscapeData } from '../types';

interface DreamscapeProps {
  data: DreamscapeData;
  onReset: () => void;
  isExploring: boolean;
  explorationImageUrl: string | null;
  explorationLoadingTheme: string | null;
  onExploreTheme: (theme: string) => void;
  onReturnToScape: () => void;
}

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.99982V5.99982" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.63604 5.63623L7.75736 7.75755" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.2426 16.2427L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.63604 18.364L7.75736 16.2427" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.2426 7.75755L18.364 5.63623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const Dreamscape: React.FC<DreamscapeProps> = ({ 
    data, 
    onReset,
    isExploring,
    explorationImageUrl,
    explorationLoadingTheme,
    onExploreTheme,
    onReturnToScape
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const playAudio = useCallback(() => {
    if (data.audioBuffer) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = data.audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      setAudioSource(source);
      setIsPlaying(true);
    }
  }, [data.audioBuffer]);
  
  const stopAudio = useCallback(() => {
    if (audioSource) {
      audioSource.stop();
      setIsPlaying(false);
    }
  }, [audioSource]);

  useEffect(() => {
    return () => {
      if (audioSource) {
        audioSource.stop();
      }
    };
  }, [audioSource]);

  const togglePlay = () => {
    if (isPlaying) stopAudio();
    else playAudio();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Main Dreamscape Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${data.imageUrl})`,
          animation: 'kenburns 20s ease-out forwards',
          opacity: isExploring ? 0 : 1,
        }}
      ></div>
      {/* Exploration Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{ 
          backgroundImage: explorationImageUrl ? `url(${explorationImageUrl})` : 'none',
          animation: 'kenburns-subtle 20s ease-out forwards',
          opacity: isExploring ? 1 : 0,
        }}
      ></div>

      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full p-4 md:p-8 text-white animate-fadeIn">
        <header className="flex justify-between items-start transition-opacity duration-500" style={{opacity: isExploring ? 0 : 1}}>
            <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-serif mb-2 leading-tight shadow-text">{data.analysis.title}</h1>
                <p className="text-xl text-purple-200 shadow-text">{data.analysis.mood}</p>
            </div>
            <button
                onClick={onReset}
                className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors duration-300"
            >
                Dream Again
            </button>
        </header>

        {isExploring && (
             <header className="flex justify-start items-start">
                 <button
                     onClick={onReturnToScape}
                     className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors duration-300 animate-fadeIn"
                 >
                     &larr; Return to Dreamscape
                 </button>
             </header>
        )}

        <footer className="w-full">
            <div className="flex justify-center mb-6 transition-opacity duration-500" style={{opacity: isExploring ? 0 : 1, pointerEvents: isExploring ? 'none' : 'auto'}}>
                <button
                    onClick={togglePlay}
                    className="w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                    aria-label={isPlaying ? 'Pause dream audio' : 'Play dream audio'}
                >
                    {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                </button>
            </div>

            <div className="w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-md p-4 rounded-lg transition-transform duration-500" style={{transform: isExploring ? 'translateY(200%)' : 'translateY(0)'}}>
                <button onClick={() => setShowDetails(!showDetails)} className="w-full text-left font-semibold text-lg mb-2">
                    {showDetails ? 'Hide Details' : 'Show Dream Details'}
                </button>
                {showDetails && (
                    <div className="space-y-4 animate-fadeInSlow">
                        <div>
                            <h3 className="font-bold text-purple-300">Explore Themes</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.analysis.themes.map((theme, index) => (
                                    <button 
                                      key={index} 
                                      onClick={() => onExploreTheme(theme)}
                                      disabled={!!explorationLoadingTheme}
                                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 text-purple-100 rounded-full text-sm hover:bg-purple-500/50 disabled:bg-gray-500/30 disabled:cursor-wait transition-all duration-300"
                                    >
                                      {explorationLoadingTheme === theme && <SpinnerIcon className="w-4 h-4 animate-spin-fast" />}
                                      {theme}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-purple-300">Original Dream</h3>
                            <p className="mt-1 text-gray-200 italic max-h-24 overflow-y-auto">{data.originalText}</p>
                        </div>
                    </div>
                )}
            </div>
        </footer>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, 2%); }
        }
        @keyframes kenburns-subtle {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.05) translate(1%, -1%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes fadeInSlow {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-fast {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
        }
        .animate-fadeIn { animation: fadeIn 1.5s ease-out forwards; }
        .animate-fadeInSlow { animation: fadeInSlow 0.5s ease-out forwards; }
        .animate-spin-fast { animation: spin-fast 1s linear infinite; }
        .shadow-text { text-shadow: 0 2px 10px rgba(0,0,0,0.7); }
      `}</style>
    </div>
  );
};

export default Dreamscape;
