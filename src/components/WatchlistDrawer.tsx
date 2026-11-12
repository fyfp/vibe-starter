import React, { useState } from 'react';
import { MarketItem, AlertItem } from '../types/market';
import { X, Trash2, Bell, Plus, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistItems: MarketItem[];
  allItems: MarketItem[];
  onSelectItem: (item: MarketItem) => void;
  onRemoveFromWatchlist: (id: string) => void;
  onAddToWatchlist: (id: string) => void;
  alerts: AlertItem[];
  onAddAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  onRemoveAlert: (id: string) => void;
  flashingIds: Record<string, 'up' | 'down'>;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistItems,
  allItems,
  onSelectItem,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  alerts,
  onAddAlert,
  onRemoveAlert,
  flashingIds,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts'>('watchlist');
  const [selectedSymbolForAlert, setSelectedSymbolForAlert] = useState(allItems[0]?.symbol || 'BTCUSD');
  const [targetPrice, setTargetPrice] = useState('95000');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [addSymbolSearch, setAddSymbolSearch] = useState('');

  if (!isOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (!isNaN(priceNum) && priceNum > 0) {
      onAddAlert(selectedSymbolForAlert, priceNum, condition);
    }
  };

  const nonWatchlistedItems = allItems
    .filter((i) => !watchlistItems.some((w) => w.id === i.id))
    .filter((i) =>
      addSymbolSearch ? i.symbol.toLowerCase().includes(addSymbolSearch.toLowerCase()) || i.name.toLowerCase().includes(addSymbolSearch.toLowerCase()) : true
    );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#131722] border-l border-[#2a2e39] shadow-2xl flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] bg-[#181c27]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`text-sm font-bold pb-0.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Watchlist ({watchlistItems.length})
          </button>
          <span className="text-[#363a45]">|</span>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`text-sm font-bold pb-0.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Alerts ({alerts.length})
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {activeTab === 'watchlist' ? (
          <>
            {/* Quick Add Symbol Input */}
            <div className="relative">
              <input
                type="text"
                value={addSymbolSearch}
                onChange={(e) => setAddSymbolSearch(e.target.value)}
                placeholder="+ Add symbol to watchlist..."
                className="w-full h-8 px-3 text-xs rounded-md bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
              />
              {addSymbolSearch && nonWatchlistedItems.length > 0 && (
                <div className="absolute top-9 left-0 right-0 z-20 max-h-48 overflow-y-auto bg-[#1e222d] border border-[#363a45] rounded-md shadow-lg divide-y divide-[#2a2e39]">
                  {nonWatchlistedItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onAddToWatchlist(item.id);
                        setAddSymbolSearch('');
                      }}
                      className="flex items-center justify-between p-2 hover:bg-[#2a2e39] cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.symbol}</span>
                        <span className="text-[#787b86] truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <Plus className="w-4 h-4 text-[#2962ff]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Watchlist Items List */}
            {watchlistItems.length === 0 ? (
              <div className="py-12 text-center text-[#787b86] text-xs">
                <p>Your watchlist is empty.</p>
                <p className="mt-1">Star instruments on the table or use the search above.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2e39]/60 font-mono">
                {watchlistItems.map((item) => {
                  const isPositive = item.changePercent >= 0;
                  const flash = flashingIds[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className={`flex items-center justify-between p-2.5 hover:bg-[#1e222d] rounded-md transition-colors cursor-pointer group ${
                        flash === 'up' ? 'bg-[#089981]/15' : flash === 'down' ? 'bg-[#f23645]/15' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.symbol}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-contain bg-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="min-w-0">
                          <div className="font-bold font-sans text-xs text-white group-hover:text-[#2962ff] transition-colors truncate">
                            {item.symbol}
                          </div>
                          <div className="text-[10px] font-sans text-[#787b86] truncate max-w-[110px]">
                            {item.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right tabular-nums">
                        <div>
                          <div className="text-xs font-bold text-white">
                            {item.price > 1000
                              ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : item.price.toFixed(2)}
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

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromWatchlist(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f23645] transition-all cursor-pointer"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Alerts Panel */
          <div className="space-y-4">
            {/* Create Alert Form */}
            <form onSubmit={handleCreateAlert} className="p-3 rounded-lg bg-[#1e222d] border border-[#2a2e39] space-y-2.5 text-xs">
              <span className="font-bold text-white block">Create New Price Alert</span>

              <div className="space-y-1">
                <label className="text-[11px] text-[#787b86]">Instrument</label>
                <select
                  value={selectedSymbolForAlert}
                  onChange={(e) => setSelectedSymbolForAlert(e.target.value)}
                  className="w-full h-8 px-2 rounded bg-[#131722] border border-[#2a2e39] text-white focus:outline-none focus:border-[#2962ff]"
                >
                  {allItems.map((item) => (
                    <option key={item.id} value={item.symbol}>
                      {item.symbol} — {item.name} (${item.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#787b86]">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full h-8 px-2 rounded bg-[#131722] border border-[#2a2e39] text-white focus:outline-none focus:border-[#2962ff]"
                  >
                    <option value="above">Crosses Above</option>
                    <option value="below">Crosses Below</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#787b86]">Target Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full h-8 px-2 rounded bg-[#131722] border border-[#2a2e39] text-white font-mono focus:outline-none focus:border-[#2962ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Set Alert</span>
              </button>
            </form>

            {/* Existing Alerts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">Active Alerts</span>
              {alerts.length === 0 ? (
                <p className="text-xs text-[#787b86] py-4 text-center">No active alerts configured.</p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white">
                            {alert.symbol} {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-[#787b86]">Created {alert.createdAt}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveAlert(alert.id)}
                        className="p-1 rounded text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
