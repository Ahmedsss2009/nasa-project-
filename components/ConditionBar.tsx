import React from 'react';

interface ConditionBarProps {
  icon: React.ReactNode;
  label: string;
  percentage: number;
  description: string;
  value?: number;
  unit?: string;
}

export const ConditionBar: React.FC<ConditionBarProps> = ({ icon, label, percentage, description, value, unit }) => {
    const getColor = (p: number) => {
        if (p >= 75) return 'bg-red-500';
        if (p >= 50) return 'bg-orange-500';
        if (p >= 25) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const barColor = getColor(percentage);

    return (
        <div title={description}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {`${percentage}%`}
                    {typeof value === 'number' && unit && (
                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                            ({value} {unit})
                        </span>
                    )}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                    className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};
