import React from 'react';
import type { CountryOverviewData, GroundingSource } from '../types';
import { GlobeIcon, MapPinIcon, SuitcaseIcon } from './icons';

interface CountryOverviewResultProps {
  data: CountryOverviewData;
  sources: GroundingSource[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const CountryOverviewResult: React.FC<CountryOverviewResultProps> = ({ data, sources }) => {
  const monthName = data.month >= 1 && data.month <= 12 ? MONTH_NAMES[data.month - 1] : 'N/A';
  
  return (
    <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-lg p-6 animate-fade-in space-y-8">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Monthly Overview: {data.country}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {monthName}, {data.year}
        </p>
      </div>
      
      <div className="p-4 bg-gray-100/50 dark:bg-gray-900/30 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Overall Summary</h3>
        <p className="text-gray-700 dark:text-gray-300">{data.overallSummary}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-sky-500 dark:text-sky-400"/>
            Regional Breakdowns
        </h3>
        <div className="space-y-4">
          {data.regionalBreakdowns.map((region, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/40">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{region.region}</h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{region.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <SuitcaseIcon className="w-6 h-6 text-green-500 dark:text-green-400"/>
            Travel Advice
        </h3>
        <ul className="space-y-2">
          {data.travelAdvice.map((advice, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 dark:text-green-400 mr-3 mt-1">&#10003;</span>
              <span className="text-gray-700 dark:text-gray-300">{advice}</span>
            </li>
          ))}
        </ul>
      </div>

      {sources.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            Data Sources
          </h3>
          <ul className="space-y-1 text-xs">
            {sources.map((source, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 mr-2">&bull;</span>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sky-700 dark:text-sky-400 hover:underline truncate"
                  title={source.title}
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};