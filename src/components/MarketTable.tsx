import React, { useState, useMemo } from 'react';
import { MarketItem } from '../types/market';
import { ArrowUpDown, ArrowUp, ArrowDown, Star, LineChart, Search, Sparkles } from 'lucide-react';

interface MarketTableProps {
  items: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
  watchlistIds: string[];
  onToggleWatchlistId: (id: string) => void;
  flashingIds: Record<string, 'up' | 'down'>;
  title?: string;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeNum' | 'rating';

export const MarketTable: React.FC<MarketTableProps> = ({
  items,
  onSelectItem,
  watchlistIds,
  onToggleWatchlistId,
  flashingIds,
  title = 'Market Quotes & Technical Screen',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers' | 'active' | 'strong_buy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('volumeNum');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Query search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchSym = item.symbol.toLowerCase().includes(q);
          const matchName = item.name.toLowerCase().includes(q);
          const matchSector = item.sector?.toLowerCase().includes(q);
          if (!matchSym && !matchName && !matchSector) return false;
        }

        // Screener preset filters
        if (filterType === 'gainers') return item.changePercent > 0;
        if (filterType === 'losers') return item.changePercent < 0;
        if (filterType === 'active') return item.volumeNum > 20000000;
        if (filterType === 'strong_buy') return item.rating === 'Strong Buy';
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'rating') {
          const ratingOrder: Record<string, number> = {
            'Strong Buy': 5,
            'Buy': 4,
            'Neutral': 3,
            'Sell': 2,
            'Strong Sell': 1,
          };
          valA = ratingOrder[a.rating] || 0;
          valB = ratingOrder[b.rating] || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, searchQuery, filterType, sortField, sortDirection]);

  // Mini sparkline renderer
  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 22;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#089981' : '#f23645';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#787b86]/50 group-hover:text-[#787b86]" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#2962ff]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#2962ff]" />
    );
  };

  return (
    <div className="rounded-lg bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 border-b border-[#2a2e39]">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
          <span className="text-xs text-[#787b86]">
            Showing {processedItems.length} instrument{processedItems.length === 1 ? '' : 's'} · Real-time quotes
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter Segmented Buttons */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#131722] border border-[#2a2e39]">
            {[
              { id: 'all', label: 'All' },
              { id: 'gainers', label: 'Gainers' },
              { id: 'losers', label: 'Losers' },
              { id: 'active', label: 'Most Active' },
              { id: 'strong_buy', label: 'Strong Buy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inline Search Input */}
          <div className="relative flex-1 md:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787b86]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-[#131722] border border-[#2a2e39] text-[#d1d4dc] placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2a2e39] bg-[#181c27] text-[#787b86] font-medium uppercase tracking-wider text-[11px] select-none">
              <th className="py-2.5 pl-4 pr-2 w-8 text-center">★</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 cursor-pointer group hover:text-[#d1d4dc]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Symbol & Name</span>
                  {renderSortIndicator('symbol')}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer group hover:text-[#d1d4dc]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Last Price</span>
                  {renderSortIndicator('price')}
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Change ($)</th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer group hover:text-[#d1d4dc]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change %</span>
                  {renderSortIndicator('changePercent')}
                </div>
              </th>
              <th className="py-2.5 px-3 text-center hidden lg:table-cell">24H Range</th>
              <th
                onClick={() => handleSort('volumeNum')}
                className="py-2.5 px-3 text-right cursor-pointer group hover:text-[#d1d4dc] hidden sm:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  {renderSortIndicator('volumeNum')}
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">Mkt Cap</th>
              <th
                onClick={() => handleSort('rating')}
                className="py-2.5 px-3 text-center cursor-pointer group hover:text-[#d1d4dc] hidden xl:table-cell"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Technical Rating</span>
                  {renderSortIndicator('rating')}
                </div>
              </th>
              <th className="py-2.5 px-3 text-center hidden sm:table-cell">Trend</th>
              <th className="py-2.5 pr-4 pl-2 text-right">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/60 font-mono tabular-nums">
            {processedItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-[#787b86]">
                  <p className="text-sm font-sans">No matching symbols found</p>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-sans text-[#2962ff] hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            ) : (
              processedItems.map((item) => {
                const isPositive = item.changePercent >= 0;
                const isWatchlisted = watchlistIds.includes(item.id);
                const flash = flashingIds[item.id];

                // 24h range percent calculation
                const dayRange = item.high24h - item.low24h || 1;
                const rangePct = Math.min(100, Math.max(0, ((item.price - item.low24h) / dayRange) * 100));

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`group hover:bg-[#242835] transition-colors cursor-pointer ${
                      flash === 'up' ? 'bg-[#089981]/15' : flash === 'down' ? 'bg-[#f23645]/15' : ''
                    }`}
                  >
                    {/* Watchlist star */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlistId(item.id);
                      }}
                      className="py-3 pl-4 pr-2 text-center cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 transition-colors ${
                          isWatchlisted
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-[#787b86]/40 hover:text-amber-400'
                        }`}
                      />
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.symbol}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-contain bg-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {item.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {item.symbol}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-mono px-1 py-0.2 bg-[#131722] rounded border border-[#2a2e39]">
                              {item.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[140px] sm:max-w-[200px]">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-bold text-white text-[13px]">
                      {item.price > 1000
                        ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : item.price > 1
                        ? item.price.toFixed(2)
                        : item.price.toFixed(4)}
                    </td>

                    {/* Change $ */}
                    <td
                      className={`py-3 px-3 text-right font-medium ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {item.change.toFixed(item.price < 2 ? 4 : 2)}
                    </td>

                    {/* Change % */}
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </td>

                    {/* 24h Range Bar */}
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#787b86] w-28 mx-auto font-mono">
                        <span className="w-8 text-right truncate">
                          {item.low24h > 1000 ? (item.low24h / 1000).toFixed(1) + 'k' : item.low24h.toFixed(1)}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#131722] rounded-full overflow-hidden relative">
                          <div
                            className={`h-full ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                            style={{ width: `${rangePct}%` }}
                          />
                        </div>
                        <span className="w-8 truncate">
                          {item.high24h > 1000 ? (item.high24h / 1000).toFixed(1) + 'k' : item.high24h.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right text-[#d1d4dc] hidden sm:table-cell">
                      {item.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 text-right text-[#787b86] hidden md:table-cell">
                      {item.marketCap || '—'}
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-3 text-center hidden xl:table-cell font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.rating.includes('Buy')
                            ? 'text-[#089981]'
                            : item.rating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#d1d4dc]'
                        }`}
                      >
                        {item.rating}
                      </span>
                    </td>

                    {/* Sparkline */}
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      {renderSparkline(item.sparkline, isPositive)}
                    </td>

                    {/* Quick chart button */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="p-1.5 rounded bg-[#131722] hover:bg-[#2962ff] text-[#787b86] hover:text-white transition-colors cursor-pointer"
                        title={`Open ${item.symbol} Interactive Chart`}
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
