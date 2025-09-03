import React, { useEffect, useState, useMemo } from 'react';
import type { PredictionData } from '../types';

interface SkyAnimationProps {
  theme: string;
  prediction: PredictionData | null;
}

const Cloud: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-48 h-16 bg-white/80 rounded-full" style={style}>
        <div className="absolute -top-6 left-8 w-24 h-24 bg-white/80 rounded-full"></div>
        <div className="absolute -top-4 right-6 w-20 h-20 bg-white/80 rounded-full"></div>
    </div>
);

const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute bg-white rounded-full" style={style}></div>
);


export const SkyAnimation: React.FC<SkyAnimationProps> = ({ theme, prediction }) => {
    const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
    const [sunPosition, setSunPosition] = useState({ x: 0, y: 0, rotation: 0 });

    useEffect(() => {
        const now = new Date();
        const currentHour = now.getHours();

        const isDay = currentHour >= 6 && currentHour < 18;
        setTimeOfDay(theme === 'dark' ? 'night' : theme === 'light' ? 'day' : (isDay ? 'day' : 'night'));

        // Calculate sun/moon path
        const totalMinutesInDay = (18 - 6) * 60; // Minutes from 6am to 6pm
        const currentMinutes = (currentHour - 6) * 60 + now.getMinutes();
        const percentageOfDay = Math.max(0, Math.min(1, currentMinutes / totalMinutesInDay));

        const rotation = -90 + (percentageOfDay * 180); // from -90deg (sunrise) to +90deg (sunset)
        setSunPosition({ rotation, x:0, y:0 }); // Position is handled by rotation

    }, [theme]);

    const stars = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 2 + 1;
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 40}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite alternate`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: 0,
            };
            return <Star key={i} style={style} />;
        });
    }, []);
    
    const clouds = useMemo(() => {
        const wetCondition = prediction?.conditions.find(
          (c) => c.name.toLowerCase() === 'very wet'
        );
        const cloudCount = wetCondition
          ? Math.round(5 + (wetCondition.likelihood / 100) * 10)
          : 5;

        return Array.from({ length: cloudCount }).map((_, i) => {
            const duration = Math.random() * 80 + 60; // 60s to 140s
            const direction = Math.random() > 0.5 ? 'drift' : 'drift-reverse';
            const delay = Math.random() * -140; // Start off-screen
            const top = Math.random() * 25; // % from top
            const scale = Math.random() * 0.5 + 0.6;
             const style = {
                top: `${top}%`,
                transform: `scale(${scale})`,
                animation: `${direction} ${duration}s linear ${delay}s infinite`,
                opacity: 0.6,
             };
            return <Cloud key={i} style={style} />;
        });
    }, [prediction]);

    const isNight = timeOfDay === 'night';
    
    // Weather effects logic
    const showRain = (prediction?.conditions.find(c => c.name.toLowerCase() === 'very wet')?.likelihood ?? 0) > 70;
    const showWind = (prediction?.conditions.find(c => c.name.toLowerCase() === 'very windy')?.likelihood ?? 0) > 70;
    const showHeat = (prediction?.conditions.find(c => c.name.toLowerCase() === 'very hot')?.likelihood ?? 0) > 70;

    return (
        <>
            <style>
                {`
                @keyframes drift {
                    from { transform: translateX(-250px) scale(var(--scale)); }
                    to { transform: translateX(100vw) scale(var(--scale)); }
                }
                @keyframes drift-reverse {
                    from { transform: translateX(100vw) scale(var(--scale)); }
                    to { transform: translateX(-250px) scale(var(--scale)); }
                }
                @keyframes twinkle {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1.2); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rain-fall {
                    from { transform: translateY(-20%) scaleY(1); opacity: 1; }
                    to { transform: translateY(120%) scaleY(1.5); opacity: 0; }
                }
                @keyframes wind-gust {
                    0% { transform: translateX(-150px) skewX(15deg); opacity: 0; }
                    20% { opacity: 0.2; }
                    80% { opacity: 0.05; }
                    100% { transform: translateX(calc(100vw + 150px)) skewX(15deg); opacity: 0; }
                }
                @keyframes heat-shimmer {
                    0%, 100% { opacity: 0; transform: scaleY(1) skewX(0); }
                    50% { opacity: 0.08; transform: scaleY(1.01) skewX(0.5deg); }
                }
                `}
            </style>
            <div className="absolute top-0 left-0 w-full h-[40vh] min-h-[300px] z-0 overflow-hidden">
                <div className={`absolute inset-0 transition-all duration-1000 ${isNight ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-sky-400 to-sky-600'}`}>
                   {isNight && stars}
                </div>

                {/* Sun/Moon Orbit Container */}
                <div className="absolute inset-0 flex justify-center items-end" style={{ perspective: '1000px' }}>
                    <div
                        className="absolute w-[180vw] h-[180vw] md:w-[120vw] md:h-[120vw] lg:w-[100vw] lg:h-[100vw] -bottom-[90vw] md:-bottom-[60vw] lg:-bottom-[50vw] transition-transform duration-3000 ease-in-out"
                        style={{ transform: `rotate(${sunPosition.rotation}deg)` }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {/* Sun Rays - only visible during the day */}
                            <div
                                className={`absolute inset-[-1.5rem] transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'}`}
                                style={{ animation: `spin-slow 20s linear infinite` }}
                            >
                                <div className="absolute top-1/2 left-1/2 w-24 h-1 bg-yellow-200/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-1/2 w-24 h-1 bg-yellow-200/50 rounded-full -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                <div className="absolute top-1/2 left-1/2 w-24 h-1 bg-yellow-200/50 rounded-full -translate-x-1/2 -translate-y-1/2 rotate-90"></div>
                                <div className="absolute top-1/2 left-1/2 w-24 h-1 bg-yellow-200/50 rounded-full -translate-x-1/2 -translate-y-1/2 rotate-[135deg]"></div>
                            </div>

                            {/* Sun/Moon Sphere */}
                            <div className={`relative w-16 h-16 rounded-full transition-all duration-1000 ${isNight ? 'bg-gray-200 shadow-lg shadow-white/20' : 'bg-yellow-300 shadow-lg shadow-yellow-200/50'}`}>
                               {/* Moon craters */}
                               {isNight && (
                                 <>
                                   <div className="absolute top-4 left-3 w-4 h-4 bg-gray-300 rounded-full opacity-60"></div>
                                   <div className="absolute bottom-3 right-2 w-6 h-6 bg-gray-300 rounded-full opacity-60"></div>
                                   <div className="absolute top-8 right-6 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
                                 </>
                               )}
                            </div>
                        </div>
                    </div>
                </div>
                 
                <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'}`}>
                    {clouds}
                </div>

                {/* Weather Effects Overlay */}
                <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                    {showRain && Array.from({ length: 25 }).map((_, i) => (
                        <div
                            key={`rain-${i}`}
                            className="absolute top-0 bg-gradient-to-b from-white/0 via-white/30 to-white/0"
                            style={{
                                width: '1px',
                                height: '50px',
                                left: `${Math.random() * 105 - 5}%`, // Allow appearing from slightly off-screen
                                animation: `rain-fall ${Math.random() * 0.4 + 0.6}s linear infinite`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                    {showWind && Array.from({ length: 6 }).map((_, i) => (
                         <div
                            key={`wind-${i}`}
                            className="absolute bg-white/[.07] h-[2px] w-48 rounded-full"
                            style={{
                                top: `${Math.random() * 60 + 10}%`,
                                animation: `wind-gust ${Math.random() * 2 + 2.5}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        />
                    ))}
                    {showHeat && !isNight && (
                        <div
                            className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white/[.08] to-transparent"
                            style={{
                                animation: `heat-shimmer 5s ease-in-out infinite`
                            }}
                        />
                    )}
                </div>

            </div>
        </>
    );
};