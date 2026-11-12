import React, { useState } from 'react';
import { MarketItem } from '../types/market';

interface HeatmapViewProps {
  items: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ items, onSelectItem }) => {
  const [filter, setFilter] = useState<'stocks' | 'crypto' | 'all'>('stocks');

  const filteredItems = items.filter((item) => {
    if (filter === 'stocks') return item.assetClass === 'stocks';
    if (filter === 'crypto') return item.assetClass === 'crypto';
    return item.assetClass === 'stocks' || item.assetClass === 'crypto' || item.assetClass === 'indices';
  });

  // Color generator based on percentage performance
  const getColorForChange = (changePercent: number) => {
    if (changePercent >= 4.0) return 'bg-[#089981] hover:bg-[#078570] text-white';
    if (changePercent >= 2.0) return 'bg-[#0aa68c] hover:bg-[#089981] text-white';
    if (changePercent >= 0.5) return 'bg-[#1e7e68] hover:bg-[#166e5a] text-white';
    if (changePercent > -0.5) return 'bg-[#363a45] hover:bg-[#404552] text-[#d1d4dc]';
    if (changePercent > -2.0) return 'bg-[#a32d39] hover:bg-[#912530] text-white';
    return 'bg-[#f23645] hover:bg-[#d92a38] text-white';
  };

  // Weight proportion calculation
  const getWeightClass = (item: MarketItem, index: number) => {
    // Mega caps get largest grid spans
    if (['NVDA', 'AAPL', 'MSFT', 'BTCUSD'].includes(item.symbol)) {
      return 'col-span-12 sm:col-span-6 lg:col-span-4 row-span-2 min-h-[140px]';
    }
    if (['GOOGL', 'AMZN', 'META', 'TSLA', 'ETHUSD', 'SPX'].includes(item.symbol)) {
      return 'col-span-6 sm:col-span-4 lg:col-span-3 min-h-[110px]';
    }
    return 'col-span-6 sm:col-span-3 lg:col-span-2 min-h-[90px]';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Market Treemap Heatmap</span>
          <span className="text-xs text-[#787b86]">· Box sizes weighted by Market Cap & Volume</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-md border border-[#2a2e39]">
          <button
            onClick={() => setFilter('stocks')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'stocks'
                ? 'bg-[#2962ff] text-white shadow'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Stocks (S&P 500)
          </button>
          <button
            onClick={() => setFilter('crypto')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'crypto'
                ? 'bg-[#2962ff] text-white shadow'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Crypto Ecosystem
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#2962ff] text-white shadow'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            All Major Assets
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-[#787b86] px-1 font-mono">
        <span>-3%</span>
        <span className="w-5 h-3 rounded bg-[#f23645]" />
        <span className="w-5 h-3 rounded bg-[#a32d39]" />
        <span className="w-5 h-3 rounded bg-[#363a45]" />
        <span className="w-5 h-3 rounded bg-[#1e7e68]" />
        <span className="w-5 h-3 rounded bg-[#089981]" />
        <span>+3%</span>
      </div>

      {/* Treemap Grid Container */}
      <div className="grid grid-cols-12 gap-2 p-2 rounded-lg bg-[#131722] border border-[#2a2e39]">
        {filteredItems.map((item, index) => {
          const colorClass = getColorForChange(item.changePercent);
          const spanClass = getWeightClass(item, index);
          const isPositive = item.changePercent >= 0;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`${spanClass} ${colorClass} p-3 rounded-md flex flex-col justify-between cursor-pointer transition-all transform hover:scale-[1.01] hover:z-10 shadow-sm relative overflow-hidden group select-none`}
            >
              {/* Header inside tile */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={item.symbol}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full object-contain bg-white/20 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span className="font-bold text-sm tracking-tight truncate drop-shadow-sm">
                    {item.symbol}
                  </span>
                </div>
                {item.marketCap && (
                  <span className="text-[10px] opacity-80 font-mono shrink-0 hidden sm:inline">
                    {item.marketCap}
                  </span>
                )}
              </div>

              {/* Center / Bottom Info */}
              <div className="mt-2">
                <div className="text-xs opacity-90 truncate hidden md:block">
                  {item.name}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs sm:text-sm font-mono font-bold">
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[11px] font-mono tabular-nums opacity-90">
                    {item.price > 1000
                      ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
