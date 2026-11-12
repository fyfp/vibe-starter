import React from 'react';
import { MarketItem } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  items: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
  flashingIds: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ items, onSelectItem, flashingIds }) => {
  // Use representative top market movers across classes
  const tapeSymbols = ['SPX', 'NDX', 'BTCUSD', 'ETHUSD', 'NVDA', 'AAPL', 'TSLA', 'GOLD', 'EURUSD', 'US10Y', 'CL1!'];
  const tapeItems = items.filter((item) => tapeSymbols.includes(item.symbol));

  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 48;
    const height = 18;
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#089981' : '#f23645';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#181c27] dark:bg-[#181c27] border-b border-[#2a2e39] overflow-hidden select-none">
      <div className="flex items-center divide-x divide-[#2a2e39] overflow-x-auto no-scrollbar py-1 text-xs">
        {tapeItems.map((item) => {
          const isPositive = item.changePercent >= 0;
          const flash = flashingIds[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`flex items-center gap-3 px-4 py-1 hover:bg-[#202534] transition-colors whitespace-nowrap shrink-0 group cursor-pointer text-left ${
                flash === 'up' ? 'bg-[#089981]/20' : flash === 'down' ? 'bg-[#f23645]/20' : ''
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#d1d4dc] group-hover:text-white transition-colors">
                  {item.symbol}
                </span>
                <span className="text-[10px] text-[#787b86] hidden sm:inline">
                  {item.exchange}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-white font-medium">
                  {item.price > 1000
                    ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : item.price > 1
                    ? item.price.toFixed(2)
                    : item.price.toFixed(4)}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono tabular-nums text-[11px] font-semibold ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {renderSparkline(item.sparkline, isPositive)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
