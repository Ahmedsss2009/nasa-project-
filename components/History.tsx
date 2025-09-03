import React, { useState, useMemo } from 'react';
import type { HistoryItem } from '../types';
import { HistoryChart } from './HistoryChart';
import { TrashIcon } from './icons';

interface HistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClearHistory }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(history.map(item => item.location))];
    if (uniqueLocations.length > 0 && (!selectedLocation || !uniqueLocations.includes(selectedLocation))) {
        setSelectedLocation(uniqueLocations[0]);
    }
    return uniqueLocations;
  }, [history, selectedLocation]);

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => item.location === selectedLocation)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, selectedLocation]);

  if (history.length === 0) return null;
  
  return (
    <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 p-6 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Prediction History</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {locations.length > 1 && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full sm:w-auto bg-gray-100/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            >
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          )}
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-red-500"
            aria-label="Clear all prediction history"
          >
            <TrashIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      
      {filteredHistory.length > 0 ? (
        <HistoryChart data={filteredHistory} />
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Select a location to view its history.
        </p>
      )}
    </div>
  );
};
