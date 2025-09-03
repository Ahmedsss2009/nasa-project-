import React, { useState, memo } from 'react';
import { SparklesIcon } from './icons';

type PredictionInputParams = 
  | { type: 'daily'; location: string; date: string }
  | { type: 'country'; country: string; month: string; year: string };

interface PredictionInputProps {
  onPredict: (params: PredictionInputParams) => void;
  isLoading: boolean;
  date: string;
  setDate: (date: string) => void;
}

const COUNTRIES = [
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'United Kingdom', 'France', 'Germany', 'Spain', 'Italy', 'Russia', 'China', 'India', 'Japan', 'Australia', 'Egypt', 'South Africa', 'Nigeria'
];

const MONTHS = [
    { value: '1', name: 'January' }, { value: '2', name: 'February' }, { value: '3', name: 'March' },
    { value: '4', name: 'April' }, { value: '5', name: 'May' }, { value: '6', name: 'June' },
    { value: '7', name: 'July' }, { value: '8', name: 'August' }, { value: '9', name: 'September' },
    { value: '10', name: 'October' }, { value: '11', name: 'November' }, { value: '12', name: 'December' }
];

export const PredictionInput: React.FC<PredictionInputProps> = memo(({ onPredict, isLoading, date, setDate }) => {
  const [mode, setMode] = useState<'daily' | 'country'>('daily');
  
  // State for daily forecast
  const [location, setLocation] = useState<string>(() => localStorage.getItem('lastLocation') || '');
  
  // State for country overview
  const [country, setCountry] = useState<string>(COUNTRIES[0]);
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'daily') {
        onPredict({ type: 'daily', location, date });
    } else {
        onPredict({ type: 'country', country, month, year });
    }
  };

  const commonInputClasses = "w-full bg-gray-100/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-base";

  return (
    <div>
        <div className="flex justify-center mb-4 border-b border-gray-300 dark:border-gray-600">
            <button
                onClick={() => setMode('daily')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out border-b-2 ${mode === 'daily' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                Daily Forecast
            </button>
            <button
                onClick={() => setMode('country')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out border-b-2 ${mode === 'country' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                Monthly Overview
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
            {mode === 'daily' ? (
                <>
                    <div className="flex-grow w-full">
                        <label htmlFor="location" className="sr-only">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., San Francisco, US"
                            className={commonInputClasses}
                            required
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <label htmlFor="date" className="sr-only">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={commonInputClasses}
                            required
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-grow w-full">
                        <label htmlFor="country" className="sr-only">Country</label>
                        <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={commonInputClasses}
                        >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                         <label htmlFor="month" className="sr-only">Month</label>
                         <select id="month" value={month} onChange={e => setMonth(e.target.value)} className={commonInputClasses}>
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                         </select>
                    </div>
                    <div className="w-full sm:w-28">
                         <label htmlFor="year" className="sr-only">Year</label>
                         <input type="number" id="year" value={year} onChange={e => setYear(e.target.value)} className={commonInputClasses} placeholder="Year" />
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-md transition duration-300 ease-in-out disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-sky-500"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Analyzing...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Predict
                    </>
                )}
            </button>
        </form>
    </div>
  );
});