import React from 'react';

interface ComfortScoreGaugeProps {
  score: number;
}

export const ComfortScoreGauge: React.FC<ComfortScoreGaugeProps> = ({ score }) => {
  const normalizedScore = Math.max(0, Math.min(10, score));
  const percentage = normalizedScore * 10;
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (normalizedScore >= 8) return 'stroke-green-500 dark:stroke-green-400';
    if (normalizedScore >= 6) return 'stroke-yellow-500 dark:stroke-yellow-400';
    if (normalizedScore >= 4) return 'stroke-orange-500 dark:stroke-orange-400';
    return 'stroke-red-600 dark:stroke-red-500';
  };
  
  const getTextColor = () => {
    if (normalizedScore >= 8) return 'text-green-500 dark:text-green-400';
    if (normalizedScore >= 6) return 'text-yellow-500 dark:text-yellow-400';
    if (normalizedScore >= 4) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-600 dark:text-red-500';
  };

  const colorClass = getColor();
  const textColorClass = getTextColor();

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          strokeWidth="10"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          strokeWidth="10"
          strokeLinecap="round"
          className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${textColorClass}`}>{normalizedScore.toFixed(1)}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">/ 10</span>
      </div>
    </div>
  );
};