import React, { useState, useMemo } from 'react';
import type { HistoryItem } from '../types';

interface HistoryChartProps {
    data: HistoryItem[];
}

const METRICS = [
    { key: 'comfortScore', label: 'Comfort Score', color: '#38bdf8' }, // sky-400
    { key: 'Very Hot', label: 'Very Hot', color: '#f97316' }, // orange-500
    { key: 'Very Cold', label: 'Very Cold', color: '#3b82f6' }, // blue-500
    { key: 'Very Windy', label: 'Very Windy', color: '#6b7280' }, // gray-500
    { key: 'Very Wet', label: 'Very Wet', color: '#06b6d4' }, // cyan-500
    { key: 'Very Uncomfortable', label: 'Very Uncomfortable', color: '#eab308' }, // yellow-500
];

const getMetricValue = (item: HistoryItem, metricKey: string): number => {
    if (metricKey === 'comfortScore') {
        return item.comfortScore;
    }
    const condition = item.conditions.find(c => c.name === metricKey);
    return condition ? condition.likelihood : 0;
};

export const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
    const [selectedMetricKey, setSelectedMetricKey] = useState('comfortScore');

    const chartData = useMemo(() => {
        return data.map(item => ({
            date: new Date(item.date),
            value: getMetricValue(item, selectedMetricKey),
        }));
    }, [data, selectedMetricKey]);
    
    const selectedMetric = METRICS.find(m => m.key === selectedMetricKey)!;
    const isScore = selectedMetricKey === 'comfortScore';
    const maxValue = isScore ? 10 : 100;
    const minValue = 0;

    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 50, left: 40 };

    const yAxisLabels = useMemo(() => {
        const labels = [];
        for (let i = 0; i <= 4; i++) {
            labels.push(minValue + (i * (maxValue - minValue)) / 4);
        }
        return labels;
    }, [minValue, maxValue]);

    const xAxisLabels = useMemo(() => {
        if (chartData.length < 1) return [];
        const uniqueDates = [...new Set(chartData.map(d => d.date.getTime()))].sort((a,b) => a - b);
        if (uniqueDates.length <= 5) {
            return uniqueDates.map(ts => new Date(ts));
        }
        const step = Math.floor((uniqueDates.length - 1) / 4);
        return [0, step, step * 2, step * 3, uniqueDates.length - 1].map(i => new Date(uniqueDates[i]));
    }, [chartData]);

    const getCoords = () => {
        if (chartData.length === 0) return [];
        const minDate = Math.min(...chartData.map(d => d.date.getTime()));
        const maxDate = Math.max(...chartData.map(d => d.date.getTime()));
        
        return chartData.map(d => {
            const dateRange = maxDate - minDate;
            const x = dateRange === 0 ? 
                padding.left + (width - padding.left - padding.right) / 2 :
                padding.left + ((d.date.getTime() - minDate) / dateRange) * (width - padding.left - padding.right);
            
            const valueRange = maxValue - minValue;
            const y = padding.top + (height - padding.top - padding.bottom) * (1 - (d.value - minValue) / valueRange);

            return { x, y };
        });
    };

    const points = getCoords();
    const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    if (data.length === 0) {
        return <div className="text-center p-4">No data to display.</div>;
    }

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="metric-select" className="sr-only">Select Metric</label>
                <select
                    id="metric-select"
                    value={selectedMetricKey}
                    onChange={(e) => setSelectedMetricKey(e.target.value)}
                    className="bg-gray-100/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                    {METRICS.map(metric => (
                        <option key={metric.key} value={metric.key}>{metric.label}</option>
                    ))}
                </select>
            </div>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]" aria-label={`Chart of ${selectedMetric.label}`}>
                    <g className="text-xs fill-current text-gray-500 dark:text-gray-400">
                        {yAxisLabels.map((label, i) => {
                            const y = padding.top + ((yAxisLabels.length - 1 - i) * (height - padding.top - padding.bottom)) / (yAxisLabels.length -1);
                            return (
                                <g key={`y-label-${i}`}>
                                    <text x={padding.left - 8} y={y} textAnchor="end" alignmentBaseline="middle">{label}</text>
                                    <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="stroke-current opacity-10 dark:opacity-20" />
                                </g>
                            )
                        })}
                    </g>

                    <g className="text-xs fill-current text-gray-500 dark:text-gray-400">
                         {xAxisLabels.map((date, i) => {
                            const minDate = Math.min(...chartData.map(d => d.date.getTime()));
                            const maxDate = Math.max(...chartData.map(d => d.date.getTime()));
                            const dateRange = maxDate - minDate;
                            const x = dateRange === 0 ? 
                                padding.left + (width - padding.left - padding.right) / 2 :
                                padding.left + ((date.getTime() - minDate) / dateRange) * (width - padding.left - padding.right);
                            return (
                                <text key={`x-label-${i}`} x={x} y={height - padding.bottom + 15} textAnchor="middle">
                                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </text>
                            )
                        })}
                    </g>
                    
                    {points.length > 1 && (
                      <path d={path} fill="none" stroke={selectedMetric.color} strokeWidth="2" />
                    )}
                    {points.map((p, i) => (
                        <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={selectedMetric.color} />
                    ))}
                </svg>
            </div>
        </div>
    );
};
