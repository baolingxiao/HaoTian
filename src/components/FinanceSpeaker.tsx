'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

interface FinanceSpeakerProps {
  newsItems: NewsItem[];
}

interface TranslatedHeadline {
  title_zh: string;
  source: string;
  url: string;
  score: number;
}

export default function FinanceSpeaker({ newsItems }: FinanceSpeakerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedHeadlines, setTranslatedHeadlines] = useState<TranslatedHeadline[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Check if Web Speech API is supported
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch translated headlines
  const fetchTranslatedHeadlines = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/finance-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translated headlines');
      }

      const data = await response.json();
      setTranslatedHeadlines(data.headlines || []);
    } catch (err) {
      console.error('Error fetching translated headlines:', err);
      setError('Failed to load translated content');
    } finally {
      setIsLoading(false);
    }
  };

  // Speak the headlines in Chinese
  const speakHeadlines = async () => {
    if (!isSpeechSupported) {
      setError('Speech synthesis not supported in this browser');
      return;
    }

    if (translatedHeadlines.length === 0) {
      await fetchTranslatedHeadlines();
      return;
    }

    try {
      setIsPlaying(true);
      setError(null);

      // Stop any current speech
      window.speechSynthesis.cancel();

      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance();
      
      // Set Chinese voice if available
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.startsWith('zh') || 
        voice.name.includes('Chinese') ||
        voice.name.includes('中文')
      );
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
        utterance.lang = 'zh-CN';
      } else {
        utterance.lang = 'zh-CN';
      }

      // Set speech parameters
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Prepare text to speak
      const introText = '财经要闻播报：';
      const headlinesText = translatedHeadlines
        .slice(0, 3)
        .map((headline, index) => `第${index + 1}条：${headline.title_zh}`)
        .join('。');
      
      const fullText = `${introText}${headlinesText}。播报完毕。`;
      utterance.text = fullText;

      // Handle speech events
      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        // Don't show error for interrupted speech (user stopped it)
        if (event.error !== 'interrupted') {
          setError(`Speech error: ${event.error}`);
        }
        setIsPlaying(false);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('Error speaking headlines:', err);
      setError('Failed to speak headlines');
      setIsPlaying(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Handle button click
  const handleClick = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speakHeadlines();
    }
  };

  // Load voices when component mounts
  useEffect(() => {
    if (isSpeechSupported) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      };

      // Some browsers need this event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, [isSpeechSupported]);

  if (!isSpeechSupported) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="text-red-400 text-xs">
          🔊 Speech not supported
        </div>
      </div>
    );
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white">
          <span>🔊</span>
          <span>播报财经要闻</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isPlaying 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <div className="w-4 h-4 bg-white rounded-sm"></div>
            <span>🔊 停止播报</span>
          </>
        ) : (
          <>
            <span>🔊</span>
            <span>播报财经要闻</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-400 text-xs">
          {error}
        </div>
      )}

      {translatedHeadlines.length > 0 && !isPlaying && (
        <div className="mt-2 text-xs text-gray-400">
          {translatedHeadlines.length} 条新闻已准备
        </div>
      )}
    </div>
  );
}
