import React, { useState, useEffect, useCallback } from 'react';
import { PredictionInput } from './components/PredictionInput';
import { PredictionResult } from './components/PredictionResult';
import { CountryOverviewResult } from './components/CountryOverviewResult';
import { History } from './components/History';
import { LogoIcon } from './components/icons';
import { ThemeToggle } from './components/ThemeToggle';
import { SkyAnimation } from './components/SkyAnimation';
import type { HistoryItem, FullPredictionResult, FullCountryOverviewResult, PredictionData, AnyPredictionResult } from './types';
import { getWeatherComfortPrediction, getCountryWeatherOverview } from './services/geminiService';

type PredictionInputParams = 
  | { type: 'daily'; location: string; date: string }
  | { type: 'country'; country: string; month: string; year: string };

const App: React.FC = () => {
  const [prediction, setPrediction] = useState<AnyPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [predictionHistory, setPredictionHistory] = useState<HistoryItem[]>([]);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Load theme and history from localStorage on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    try {
        const storedHistory = localStorage.getItem('predictionHistory');
        if (storedHistory) {
          setPredictionHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        setPredictionHistory([]);
      }
  }, [theme]);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      if (predictionHistory.length > 0) {
        localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
      } else {
        localStorage.removeItem('predictionHistory');
      }
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [predictionHistory]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);
  
  const handleClearHistory = useCallback(() => {
    setPredictionHistory([]);
  }, []);

  const handlePredict = useCallback(async (params: PredictionInputParams) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      let result;
      if (params.type === 'daily') {
        if (!params.location || !params.date) {
          setError('Please provide a location and a date.');
          setIsLoading(false);
          return;
        }
        try {
          localStorage.setItem('lastLocation', params.location);
        } catch (e) {
          console.error("Failed to save last location to localStorage", e);
        }
        const query = `Weather in ${params.location} on ${params.date}`;
        result = await getWeatherComfortPrediction(query);
        setPrediction(result);
        
        // Add daily forecasts to history
        const newHistoryItem: HistoryItem = {
            ...result.prediction,
            id: `${result.prediction.location}-${result.prediction.date}-${Date.now()}`,
        };
        setPredictionHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, 50));

      } else { // 'country'
        if (!params.country || !params.month || !params.year) {
            setError('Please provide a country, month, and year.');
            setIsLoading(false);
            return;
        }
        result = await getCountryWeatherOverview({
            country: params.country,
            month: parseInt(params.month, 10),
            year: parseInt(params.year, 10),
        });
        setPrediction(result);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDailyPredictionForSky = (): PredictionData | null => {
    if (prediction && prediction.type === 'daily') {
        return prediction.data.prediction;
    }
    return null;
  }

  const WelcomeScreen: React.FC = () => (
    <div className="text-center p-8">
        <div className="inline-block bg-sky-500/20 p-4 rounded-full mb-6 animate-pulse">
            <LogoIcon className="w-16 h-16 text-sky-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Weather Comfort Predictor</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400">Select a mode above to get an AI-powered weather forecast.</p>
    </div>
  );

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden">
      <SkyAnimation theme={theme} prediction={getDailyPredictionForSky()} />
      
      <div className="relative z-10 flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8">
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <LogoIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Weather Comfort Predictor</h1>
            </div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>

        <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col">
          <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 p-6 backdrop-blur-md mb-8">
              <PredictionInput 
                onPredict={handlePredict} 
                isLoading={isLoading}
                date={date}
                setDate={setDate}
              />
          </div>
          
          <div className="flex-grow w-full">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">AI is analyzing real-time web data...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl">
                    <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">An Error Occurred</h3>
                    <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
                </div>
              )}
              {!isLoading && !error && prediction?.type === 'daily' && <PredictionResult data={prediction.data.prediction} sources={prediction.data.sources} />}
              {!isLoading && !error && prediction?.type === 'country' && <CountryOverviewResult data={prediction.data.overview} sources={prediction.data.sources} />}
              {!isLoading && !error && !prediction && <WelcomeScreen />}
          </div>
          
          {predictionHistory.length > 0 && !isLoading && (
              <div className="w-full max-w-4xl mx-auto mt-8">
                  <History history={predictionHistory} onClearHistory={handleClearHistory} />
              </div>
          )}

        </main>

        <footer className="w-full max-w-4xl mx-auto text-center mt-8 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">Powered by AI. Forecasts are predictive and not guaranteed.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;