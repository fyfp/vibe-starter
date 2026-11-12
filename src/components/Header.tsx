import React from 'react';
import { Search, Bookmark, Sun, Moon, Activity, SlidersHorizontal, Sparkles } from 'lucide-react';
import { AssetClass } from '../types/market';

interface HeaderProps {
  currentTab: AssetClass | 'overview';
  onSelectTab: (tab: AssetClass | 'overview') => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  viewMode: 'table' | 'heatmap';
  onToggleViewMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  isDark,
  onToggleTheme,
  isSimulating,
  onToggleSimulation,
  viewMode,
  onToggleViewMode,
}) => {
  const tabs: { id: AssetClass | 'overview'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39] dark:border-[#2a2e39] bg-[#131722] dark:bg-[#131722] text-[#d1d4dc] transition-colors">
      {/* Primary Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-5 Nav Links) - Zone 3 (Primary Action) */}
      <div className="flex h-14 items-center justify-between gap-6 px-4 lg:px-6">
        
        {/* Zone 1: Single element wordmark with iconic TradingView TV shape */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            title="TradingView Markets"
          >
            {/* Iconic TradingView logo mark geometric construct */}
            <div className="w-8 h-8 rounded-md bg-[#2962ff] flex items-center justify-center shadow-sm group-hover:bg-[#1e53e5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18V21C4 22.1046 4.89543 23 6 23H9V18H4Z" fill="white" />
                <path d="M11 11V23H17V11H11Z" fill="white" />
                <path d="M19 5V23H22C23.1046 23 24 22.1046 24 21V5H19Z" fill="white" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] whitespace-nowrap shrink-0">
              TradingView <span className="text-[#2962ff] font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-[#2962ff]/10">MARKETS</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, no wrapping) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#2a2e39] font-semibold shadow-inner'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Functional Search & Utilities */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 h-8 px-3 rounded-md bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] border border-[#2a2e39] text-xs transition-colors cursor-pointer"
            title="Search symbols (⌘K or /)"
          >
            <Search className="w-3.5 h-3.5 text-[#787b86]" />
            <span className="hidden sm:inline">Search markets...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] rounded border border-[#363a45] text-[#787b86]">
              ⌘K
            </kbd>
          </button>

          {/* Heatmap Toggle */}
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc] border-[#2a2e39]'
            }`}
            title="Toggle Treemap Heatmap View"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heatmap</span>
          </button>

          {/* Live Tick Simulation Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isSimulating
                ? 'bg-[#089981]/15 text-[#089981] border-[#089981]/40'
                : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc] border-[#2a2e39]'
            }`}
            title={isSimulating ? 'Live Ticks Active (click to pause)' : 'Simulation Paused (click to activate)'}
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse text-[#089981]' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Live' : 'Paused'}</span>
          </button>

          {/* Watchlist Drawer Trigger */}
          <button
            onClick={onToggleWatchlist}
            className="relative flex items-center justify-center w-8 h-8 rounded-md bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] border border-[#2a2e39] transition-colors cursor-pointer"
            title="Watchlist & Alerts"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2962ff] px-1 text-[9px] font-bold text-white">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] hover:text-white border border-[#2a2e39] transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation Strip */}
      <div className="flex md:hidden items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-t border-[#2a2e39] bg-[#181c27]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2962ff] text-white font-semibold'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
