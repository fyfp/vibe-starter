import React, { useState, useEffect, useRef } from 'react';
import { MarketItem, AssetClass } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, items, onSelectItem }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetClass | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        onSelectItem(filteredItems[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.assetClass !== selectedCategory) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.exchange.toLowerCase().includes(q)
    );
  });

  const categories: { id: AssetClass | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 pt-16 sm:pt-24">
      <div className="w-full max-w-2xl rounded-xl bg-[#131722] border border-[#2a2e39] shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39] bg-[#181c27]">
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search symbol, ticker, company, crypto, or forex pair..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#787b86] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787b86] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] rounded border border-[#363a45] text-[#787b86]">
            ESC
          </kbd>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#2a2e39] bg-[#1e222d] overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2a2e39]/50 p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#787b86] text-xs">
              <p>No symbols match "{query}"</p>
              <p className="mt-1">Try searching for AAPL, BTC, SPX, or NVDA</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isPositive = item.changePercent >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#2962ff]/15 border border-[#2962ff]/40' : 'hover:bg-[#1e222d]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                      <div className="w-6 h-6 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center font-bold text-[10px]">
                        {item.symbol.slice(0, 2)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.symbol}</span>
                        <span className="text-[10px] text-[#787b86] px-1 py-0.5 rounded bg-[#131722] border border-[#2a2e39] font-mono">
                          {item.exchange}
                        </span>
                        <span className="text-[10px] text-[#787b86] capitalize">
                          {item.assetClass}
                        </span>
                      </div>
                      <div className="text-xs text-[#787b86] truncate max-w-sm">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono tabular-nums text-right shrink-0">
                    <div>
                      <div className="text-xs font-bold text-white">
                        {item.price > 1000
                          ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : item.price.toFixed(item.price < 2 ? 4 : 2)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        <span>
                          {isPositive ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#787b86] group-hover:text-white" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 text-[11px] text-[#787b86] bg-[#181c27] border-t border-[#2a2e39]">
          <div className="flex items-center gap-3">
            <span>Use ↑ ↓ to navigate</span>
            <span>↵ to open chart</span>
          </div>
          <span>TradingView Search</span>
        </div>
      </div>
    </div>
  );
};
