
import React, { useState, useEffect } from 'react';

const messages = [
  "Weaving the threads of your subconscious...",
  "Translating emotions into pixels...",
  "Listening to the echoes of your dream...",
  "Consulting the digital oracle...",
  "Brewing a visual symphony...",
  "Gathering stardust and moonbeams..."
];

const LoadingWeaver: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="relative w-24 h-24 mb-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-75 animate-pulse"
            style={{
              animation: `spin 3s linear infinite, fade 3s ease-in-out infinite`,
              animationDelay: `${i * -1}s`,
              transformOrigin: 'center',
            }}
          ></div>
        ))}
        <div className="absolute inset-2 rounded-full bg-purple-500/20"></div>
      </div>
      <p className="text-lg font-light text-gray-300 transition-opacity duration-1000 ease-in-out">{message}</p>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};

export default LoadingWeaver;
