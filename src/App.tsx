/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MarketItem, AssetClass, AlertItem } from './types/market';
import {
  INITIAL_MARKET_DATA,
  MARKET_SECTORS,
  MARKET_NEWS,
} from './data/marketData';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketHero } from './components/MarketHero';
import { MarketTable } from './components/MarketTable';
import { HeatmapView } from './components/HeatmapView';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';
import { YieldCurveChart } from './components/YieldCurveChart';
import { NewsSection } from './components/NewsSection';

export default function App() {
  const [items, setItems] = useState<MarketItem[]>(INITIAL_MARKET_DATA);
  const [currentTab, setCurrentTab] = useState<AssetClass | 'overview'>('overview');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['nvda', 'btcusd', 'spx', 'gold', 'tsla']);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [flashingIds, setFlashingIds] = useState<Record<string, 'up' | 'down'>>({});
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      symbol: 'BTCUSD',
      targetPrice: 95000,
      condition: 'above',
      createdAt: 'Today 10:15 AM',
      triggered: false,
    },
    {
      id: 'alert-2',
      symbol: 'NVDA',
      targetPrice: 150,
      condition: 'above',
      createdAt: 'Today 11:30 AM',
      triggered: false,
    },
  ]);

  // Sync theme with HTML document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Global keyboard shortcuts (⌘K or / for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time market tick simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setItems((prevItems) => {
        // Pick a random asset to update
        const randomIndex = Math.floor(Math.random() * prevItems.length);
        const target = prevItems[randomIndex];
        if (!target) return prevItems;

        // Micro-tick price change (-0.3% to +0.35%)
        const pctDelta = (Math.random() * 0.006 - 0.0028) * (target.assetClass === 'crypto' ? 2 : 1);
        const newPrice = Math.max(0.001, target.price * (1 + pctDelta));
        const priceDiff = newPrice - target.prevClose;
        const newChangePct = (priceDiff / target.prevClose) * 100;
        const isTickUp = newPrice >= target.price;

        // Trigger flash highlight
        setFlashingIds((prev) => ({
          ...prev,
          [target.id]: isTickUp ? 'up' : 'down',
        }));

        // Clear flash after 1 second
        setTimeout(() => {
          setFlashingIds((prev) => {
            const next = { ...prev };
            delete next[target.id];
            return next;
          });
        }, 1100);

        // Check alerts
        alerts.forEach((alert) => {
          if (alert.symbol === target.symbol && !alert.triggered) {
            if (alert.condition === 'above' && newPrice >= alert.targetPrice) {
              alert.triggered = true;
            } else if (alert.condition === 'below' && newPrice <= alert.targetPrice) {
              alert.triggered = true;
            }
          }
        });

        // Update sparkline
        const updatedSparkline = [...target.sparkline.slice(1), Number(newPrice.toFixed(target.price < 2 ? 4 : 2))];

        const updatedItem: MarketItem = {
          ...target,
          price: Number(newPrice.toFixed(target.price < 2 ? 4 : 2)),
          change: Number(priceDiff.toFixed(target.price < 2 ? 4 : 2)),
          changePercent: Number(newChangePct.toFixed(2)),
          high24h: Math.max(target.high24h, newPrice),
          low24h: Math.min(target.low24h, newPrice),
          sparkline: updatedSparkline,
        };

        const nextList = [...prevItems];
        nextList[randomIndex] = updatedItem;

        // Keep selectedItem in sync if open
        if (selectedItem && selectedItem.id === target.id) {
          setSelectedItem(updatedItem);
        }

        return nextList;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulating, selectedItem, alerts]);

  // Watchlist helpers
  const handleToggleWatchlistId = useCallback((id: string) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: 'Just now',
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const watchlistItems = items.filter((i) => watchlistIds.includes(i.id));

  // Filter items by active tab
  const tabItems = currentTab === 'overview' ? items : items.filter((i) => i.assetClass === currentTab);

  // Quick symbol click handler (from news mentions or hero)
  const handleSelectSymbolString = (symbol: string) => {
    const found = items.find((i) => i.symbol === symbol);
    if (found) {
      setSelectedItem(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] dark:bg-[#131722] text-[#d1d4dc] flex flex-col font-['Plus_Jakarta_Sans'] transition-colors">
      {/* 1. Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (viewMode === 'heatmap' && tab !== 'overview') {
            setViewMode('table');
          }
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleWatchlist={() => setWatchlistOpen(!watchlistOpen)}
        watchlistCount={watchlistIds.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'table' ? 'heatmap' : 'table')}
      />

      {/* 2. Top Live Ticker Tape */}
      <TickerTape
        items={items}
        onSelectItem={(item) => setSelectedItem(item)}
        flashingIds={flashingIds}
      />

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-6 py-6 space-y-8">
        {/* HERO AREA (Visible on Overview) */}
        {currentTab === 'overview' && (
          <MarketHero
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            flashingIds={flashingIds}
          />
        )}

        {/* SCREEN SPECIFIC VIEWS */}
        {viewMode === 'heatmap' ? (
          <HeatmapView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        ) : (
          <div className="space-y-8">
            {/* Dedicated tab headline if not on overview */}
            {currentTab !== 'overview' && (
              <div className="border-b border-[#2a2e39] pb-4">
                <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1">
                  <span>TradingView Markets</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{currentTab}</span>
                </div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {currentTab === 'stocks'
                    ? 'US & Global Stocks Screener'
                    : currentTab === 'crypto'
                    ? 'Cryptocurrency Market Quotes & Dominance'
                    : currentTab === 'forex'
                    ? 'Forex Currency Pairs & Spreads'
                    : currentTab === 'indices'
                    ? 'Global Benchmark Stock Indices'
                    : currentTab === 'futures'
                    ? 'Commodities & Energy Futures'
                    : 'Global Sovereign Bond Yields & Rates'}
                </h1>
                <p className="text-xs text-[#787b86] mt-1">
                  Live real-time quotes, technical analysis ratings, 24h volatility, and volume
                </p>
              </div>
            )}

            {/* Special Section: Yield Curve visualizer on Bonds tab */}
            {currentTab === 'bonds' && <YieldCurveChart />}

            {/* Market Screener Table */}
            <MarketTable
              items={tabItems}
              onSelectItem={(item) => setSelectedItem(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlistId={handleToggleWatchlistId}
              flashingIds={flashingIds}
              title={
                currentTab === 'overview'
                  ? 'Active Markets & Cross-Asset Screener'
                  : `${currentTab.toUpperCase()} Instruments`
              }
            />

            {/* News and Sector Performance (on Overview screen) */}
            {currentTab === 'overview' && (
              <NewsSection
                news={MARKET_NEWS}
                sectors={MARKET_SECTORS}
                onSelectSymbol={handleSelectSymbolString}
              />
            )}
          </div>
        )}
      </main>

      {/* 4. Global Interactive Chart Modal */}
      {selectedItem && (
        <InteractiveChartModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isWatchlisted={watchlistIds.includes(selectedItem.id)}
          onToggleWatchlist={() => handleToggleWatchlistId(selectedItem.id)}
        />
      )}

      {/* 5. Right Slide-over Watchlist & Alerts Panel */}
      <WatchlistDrawer
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlistItems={watchlistItems}
        allItems={items}
        onSelectItem={(item) => {
          setSelectedItem(item);
          setWatchlistOpen(false);
        }}
        onRemoveFromWatchlist={(id) => handleToggleWatchlistId(id)}
        onAddToWatchlist={(id) => handleToggleWatchlistId(id)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={handleRemoveAlert}
        flashingIds={flashingIds}
      />

      {/* 6. Quick Search Palette Modal (⌘K / /) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={items}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-[#2a2e39] bg-[#0c0e14] py-8 text-xs text-[#787b86]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 28 28" fill="none">
                <path d="M4 18V21C4 22.1046 4.89543 23 6 23H9V18H4Z" fill="white" />
                <path d="M11 11V23H17V11H11Z" fill="white" />
                <path d="M19 5V23H22C23.1046 23 24 22.1046 24 21V5H19Z" fill="white" />
              </svg>
            </div>
            <span className="text-[#d1d4dc] font-semibold">TradingView Markets</span>
            <span className="text-[#363a45]">·</span>
            <span>Real-time Financial Quotes & Analytics</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#787b86]">
            <span>Data provided for informational purposes only.</span>
            <span>Market quotes delayed where required by exchanges.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
