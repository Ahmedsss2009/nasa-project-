
import React from 'react';
import type { PredictionData, Condition, GroundingSource } from '../types';
import { HotIcon, ColdIcon, WindIcon, WetIcon, UncomfortableIcon, ActivityIcon, GlobeIcon } from './icons';
import { ComfortScoreGauge } from './ComfortScoreGauge';
import { ConditionBar } from './ConditionBar';

interface PredictionResultProps {
  data: PredictionData;
  sources: GroundingSource[];
}

const getIconForCondition = (conditionName: string, customClassName?: string) => {
  const baseClasses = customClassName || "w-6 h-6";
  switch (conditionName.toLowerCase()) {
    case 'very hot':
      return <HotIcon className={`${baseClasses} text-orange-500 dark:text-orange-400`} />;
    case 'very cold':
      return <ColdIcon className={`${baseClasses} text-blue-500 dark:text-blue-400`} />;
    case 'very windy':
      return <WindIcon className={`${baseClasses} text-gray-500 dark:text-gray-400`} />;
    case 'very wet':
      return <WetIcon className={`${baseClasses} text-cyan-500 dark:text-cyan-400`} />;
    case 'very uncomfortable':
      return <UncomfortableIcon className={`${baseClasses} text-yellow-500 dark:text-yellow-400`} />;
    default:
      return null;
  }
};

export const PredictionResult: React.FC<PredictionResultProps> = ({ data, sources }) => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-lg p-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Comfort Score and Summary */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-gray-100/50 dark:bg-gray-900/30 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Overall Comfort Score</h3>
          <ComfortScoreGauge score={data.comfortScore} />
          <p className="mt-6 text-gray-600 dark:text-gray-400">{data.summary}</p>
        </div>

        {/* Right Side: Conditions and Recommendations */}
        <div className="lg:col-span-2 space-y-8">

          {/* At a Glance Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">At a Glance</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
              {data.conditions.map((condition) => {
                const likelihood = condition.likelihood;
                const textColor = 
                  likelihood >= 75 ? 'text-red-500 dark:text-red-400' :
                  likelihood >= 50 ? 'text-orange-500 dark:text-orange-400' :
                  likelihood >= 25 ? 'text-yellow-500 dark:text-yellow-400' :
                  'text-gray-500 dark:text-gray-400';

                return (
                  <div 
                    key={`${condition.name}-glance`}
                    className={`relative group p-3 rounded-lg transition-all duration-300 ${
                      likelihood >= 50 ? 'bg-gray-200/60 dark:bg-gray-700/60' : 'bg-gray-100/50 dark:bg-gray-900/40'
                    }`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-black rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-20">
                      {condition.name}: {condition.likelihood}%
                    </div>
                    
                    {/* Icon */}
                    <div className={`mx-auto w-10 h-10 flex items-center justify-center transition-opacity duration-300 ${
                      likelihood < 25 ? 'opacity-30' : 'opacity-100'
                    }`}>
                      {getIconForCondition(condition.name, "w-8 h-8")}
                    </div>

                    {/* Percentage */}
                    <p className={`mt-2 text-sm font-semibold ${textColor}`}>
                      {likelihood}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Condition Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Condition Details</h3>
            <div className="space-y-3">
              {data.conditions.map((condition: Condition) => (
                <ConditionBar 
                  key={condition.name} 
                  icon={getIconForCondition(condition.name)}
                  label={condition.name}
                  percentage={condition.likelihood}
                  description={condition.description}
                  value={condition.value}
                  unit={condition.unit}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Recommendations</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <ActivityIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
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
      </div>
    </div>
  );
};
