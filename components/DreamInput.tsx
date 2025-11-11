
import React, { useState } from 'react';

interface DreamInputProps {
  onSubmit: (dreamText: string) => void;
  isLoading: boolean;
}

const DreamInput: React.FC<DreamInputProps> = ({ onSubmit, isLoading }) => {
  const [dreamText, setDreamText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dreamText.trim() && !isLoading) {
      onSubmit(dreamText);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 animate-fadeIn">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-2 tracking-wider">Dream Weaver</h1>
        <p className="text-lg text-purple-300 mb-8">Tell me what you dreamt. I will give it form.</p>

        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="Last night, I dreamt of a city floating on clouds of forgotten time..."
            className="w-full h-48 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-all duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !dreamText.trim()}
            className="mt-6 px-12 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-purple-900/50"
          >
            {isLoading ? 'Weaving...' : 'Weave Dream'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DreamInput;
