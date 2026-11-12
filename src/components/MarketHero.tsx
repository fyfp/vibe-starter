import React, { useState } from 'react';
import { MarketItem, MarketHours } from '../types/market';
import { MARKET_HOURS } from '../data/marketData';
import { ArrowUpRight, ArrowDownRight, Globe2, Clock } from 'lucide-react';

interface MarketHeroProps {
  items: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
  flashingIds: Record<string, 'up' | 'down'>;
}

export const MarketHero: React.FC<MarketHeroProps> = ({ items, onSelectItem, flashingIds }) => {
  const [heroTimeframe, setHeroTimeframe] = useState<'1D' | '5D' | '1M' | '1Y' | 'ALL'>('1D');

  // Key indices to spotlight
  const spotlightSymbols = ['SPX', 'NDX', 'BTCUSD', 'US10Y', 'GOLD', 'NVDA'];
  const spotlightItems = spotlightSymbols
    .map((sym) => items.find((i) => i.symbol === sym))
    .filter(Boolean) as MarketItem[];

  // Timeframe multiplier for sparkline simulation
  const getTimeframeMultiplier = (tf: string) => {
    switch (tf) {
      case '5D': return 1.4;
      case '1M': return 2.1;
      case '1Y': return 3.5;
      case 'ALL': return 5.0;
      default: return 1.0;
    }
  };

  const renderAreaChart = (sparkline: number[], isPositive: boolean) => {
    if (!sparkline || sparkline.length < 2) return null;
    const mult = getTimeframeMultiplier(heroTimeframe);
    const data = sparkline.map((v, i) => v * (1 + (Math.sin(i * 1.5) * 0.008 * (mult - 1))));

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 220;
    const height = 64;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 12) - 6;
      return { x, y };
    });

    const pathD = points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x},${curr.y}`, '');
    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    const color = isPositive ? '#089981' : '#f23645';
    const gradientId = `hero-grad-${Math.random().toString(36).substring(2, 8)}`;

    return (
      <div className="relative w-full h-16 mt-2 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Global Market Hours Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-xs">
        <div className="flex items-center gap-2 text-[#d1d4dc] font-medium shrink-0">
          <Globe2 className="w-4 h-4 text-[#2962ff]" />
          <span>Global Market Hours</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {MARKET_HOURS.map((mh) => (
            <div key={mh.market} className="flex items-center gap-2 whitespace-nowrap text-[11px]">
              <span className="text-sm">{mh.flag}</span>
              <span className="text-[#787b86]">{mh.market.split('(')[0].trim()}:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  mh.isOpen ? 'text-[#089981]' : 'text-[#787b86]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mh.isOpen ? 'bg-[#089981]' : 'bg-[#787b86]'}`} />
                {mh.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Header with Timeframe Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Global Markets Overview
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Real-time multi-asset indices, active commodities, crypto momentum, and benchmark rates
          </p>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#1e222d] rounded-lg border border-[#2a2e39] self-start sm:self-auto">
          {(['1D', '5D', '1M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setHeroTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                heroTimeframe === tf
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Key Indices Card Grid (1440px balanced layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {spotlightItems.map((item) => {
          const isPositive = item.changePercent >= 0;
          const flash = flashingIds[item.id];

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`group flex flex-col justify-between p-3.5 rounded-lg bg-[#1e222d] hover:bg-[#242835] border border-[#2a2e39] hover:border-[#363a45] transition-all cursor-pointer relative overflow-hidden ${
                flash === 'up' ? 'bg-[#089981]/15' : flash === 'down' ? 'bg-[#f23645]/15' : ''
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.symbol}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-contain bg-white/10 shrink-0"
                        onError={(e) => {
                          // Resilient fallback container if hotlink fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center text-[10px] font-bold">
                        {item.symbol.slice(0, 2)}
                      </div>
                    )}
                    <span className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors truncate">
                      {item.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#787b86] font-mono shrink-0">
                    {item.exchange}
                  </span>
                </div>

                <div className="text-[11px] text-[#787b86] truncate mt-0.5">
                  {item.name}
                </div>
              </div>

              {/* Price & Change */}
              <div className="mt-2.5">
                <div className="text-lg font-bold font-mono tabular-nums text-white tracking-tight">
                  {item.price > 1000
                    ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : item.price > 1
                    ? item.price.toFixed(2)
                    : item.price.toFixed(4)}
                </div>

                <div
                  className={`flex items-center gap-1 font-mono tabular-nums text-xs font-semibold mt-0.5 ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[#787b86] font-normal">
                    ({isPositive ? '+' : ''}
                    {item.change > 0 ? item.change.toFixed(2) : item.change.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Area Sparkline */}
              {renderAreaChart(item.sparkline, isPositive)}

              {/* Technical Indicator Rating pill-free text */}
              <div className="flex items-center justify-between text-[10px] text-[#787b86] pt-2 border-t border-[#2a2e39]/60">
                <span>Rating</span>
                <span
                  className={`font-semibold ${
                    item.rating.includes('Buy')
                      ? 'text-[#089981]'
                      : item.rating.includes('Sell')
                      ? 'text-[#f23645]'
                      : 'text-[#d1d4dc]'
                  }`}
                >
                  {item.rating}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
