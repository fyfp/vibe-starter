import React, { useState, useMemo } from 'react';
import { MarketItem, Candle } from '../types/market';
import { generateCandles } from '../data/marketData';
import {
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  Star,
  Sliders,
  BarChart2,
  Layers,
  Crosshair,
  Check,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface InteractiveChartModalProps {
  item: MarketItem | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type ChartType = 'candles' | 'line' | 'area' | 'heikin';

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  item,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  if (!item) return null;

  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mouse hover crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Order ticket state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Generate historical candles for this instrument
  const candles: Candle[] = useMemo(() => {
    const count = timeframe === '1W' ? 40 : timeframe === '1D' ? 50 : 60;
    return generateCandles(item.price, count, item.assetClass === 'crypto' ? 0.025 : 0.012);
  }, [item.id, timeframe, item.price, item.assetClass]);

  // Compute Moving Averages
  const ma20 = useMemo(() => {
    return candles.map((_, i) => {
      if (i < 19) return null;
      const slice = candles.slice(i - 19, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 20;
    });
  }, [candles]);

  const ma50 = useMemo(() => {
    return candles.map((_, i) => {
      if (i < 49) return null;
      const slice = candles.slice(i - 49, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 50;
    });
  }, [candles]);

  // Compute RSI (14)
  const rsiSeries = useMemo(() => {
    const period = 14;
    const rsi: (number | null)[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < period) {
        rsi.push(null);
        continue;
      }
      let gains = 0;
      let losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = candles[j].close - candles[j - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period || 0.0001;
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
    return rsi;
  }, [candles]);

  // Bounds for chart scaling
  const minPrice = Math.min(...candles.map((c) => c.low)) * 0.998;
  const maxPrice = Math.max(...candles.map((c) => c.high)) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map((c) => c.volume)) || 1;

  // Chart dimensions
  const chartWidth = 920;
  const mainChartHeight = 340;
  const volumeHeight = 60;
  const rsiHeight = 80;

  const getX = (index: number) => {
    const padding = 20;
    const availableWidth = chartWidth - padding * 2;
    return padding + (index / (candles.length - 1)) * availableWidth;
  };

  const getY = (price: number) => {
    const topPadding = 15;
    const bottomPadding = 15;
    const availableHeight = mainChartHeight - topPadding - bottomPadding;
    return topPadding + (1 - (price - minPrice) / priceRange) * availableHeight;
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const isPositive = item.changePercent >= 0;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Calculate nearest candle index
    const scale = chartWidth / rect.width;
    const svgX = x * scale;
    const padding = 20;
    const availableWidth = chartWidth - padding * 2;
    const ratio = Math.max(0, Math.min(1, (svgX - padding) / availableWidth));
    const idx = Math.round(ratio * (candles.length - 1));
    setHoverIndex(idx);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    setTimeout(() => {
      setOrderSubmitted(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div
        className={`relative w-full ${
          isFullscreen ? 'h-full max-w-none' : 'max-w-6xl max-h-[96vh]'
        } flex flex-col rounded-xl bg-[#131722] border border-[#2a2e39] shadow-2xl overflow-hidden transition-all`}
      >
        {/* Top Header / Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#2a2e39] bg-[#181c27]">
          {/* Symbol info */}
          <div className="flex items-center gap-3">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.symbol}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-contain bg-white/10 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center font-bold text-xs">
                {item.symbol.slice(0, 2)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight">{item.symbol}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#787b86] font-mono">
                  {item.exchange}
                </span>
                <button
                  onClick={onToggleWatchlist}
                  className="p-1 text-[#787b86] hover:text-amber-400 cursor-pointer"
                  title="Add to Watchlist"
                >
                  <Star className={`w-4 h-4 ${isWatchlisted ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-xs text-[#787b86]">{item.name}</div>
            </div>
          </div>

          {/* Live quote metrics */}
          <div className="flex items-center gap-4 sm:gap-6 font-mono tabular-nums">
            <div>
              <div className="text-xl font-bold text-white tracking-tight">
                {item.price > 1000
                  ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : item.price > 1
                  ? item.price.toFixed(2)
                  : item.price.toFixed(4)}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}
                  {item.changePercent.toFixed(2)}% ({isPositive ? '+' : ''}
                  {item.change.toFixed(item.price < 2 ? 4 : 2)})
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-xs text-[#787b86] border-l border-[#2a2e39] pl-4">
              <div>
                <span className="block text-[10px] text-[#787b86]">24H HIGH</span>
                <span className="text-white font-medium">{item.high24h.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#787b86]">24H LOW</span>
                <span className="text-white font-medium">{item.low24h.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#787b86]">VOLUME</span>
                <span className="text-white font-medium">{item.volume}</span>
              </div>
            </div>
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-md text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart Toolbar: Timeframes, Chart Styles, Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-[#2a2e39] bg-[#1e222d] text-xs">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1">
            {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 border-l border-r border-[#2a2e39] px-2">
            {[
              { id: 'candles', label: 'Candles' },
              { id: 'line', label: 'Line' },
              { id: 'area', label: 'Area' },
              { id: 'heikin', label: 'Heikin-Ashi' },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setChartType(style.id as ChartType)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  chartType === style.id
                    ? 'bg-[#2a2e39] text-white font-semibold'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Indicators Toggle Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMA20(!showMA20)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                showMA20
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                  : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
              }`}
            >
              MA 20
            </button>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                showMA50
                  ? 'bg-amber-400/20 text-amber-400 border-amber-400/50'
                  : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
              }`}
            >
              MA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                showBollinger
                  ? 'bg-purple-400/20 text-purple-400 border-purple-400/50'
                  : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
              }`}
            >
              BB (20,2)
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                showRSI
                  ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/50'
                  : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                showVolume
                  ? 'bg-sky-400/20 text-sky-400 border-sky-400/50'
                  : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
              }`}
            >
              Vol
            </button>
          </div>
        </div>

        {/* OHLC Bar Info on Active Candle */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 bg-[#131722] border-b border-[#2a2e39]/50 text-[11px] font-mono tabular-nums text-[#787b86]">
          <span>TIME: <span className="text-white">{activeCandle?.time || '—'}</span></span>
          <span>O: <span className="text-white">{activeCandle?.open.toFixed(2)}</span></span>
          <span>H: <span className="text-white">{activeCandle?.high.toFixed(2)}</span></span>
          <span>L: <span className="text-white">{activeCandle?.low.toFixed(2)}</span></span>
          <span>C: <span className={activeCandle?.close >= activeCandle?.open ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle?.close.toFixed(2)}</span></span>
          <span>VOL: <span className="text-white">{activeCandle?.volume.toLocaleString()}</span></span>
          {showMA20 && hoverIndex !== null && ma20[hoverIndex] && (
            <span className="text-[#2962ff]">MA20: {ma20[hoverIndex]?.toFixed(2)}</span>
          )}
          {showMA50 && hoverIndex !== null && ma50[hoverIndex] && (
            <span className="text-amber-400">MA50: {ma50[hoverIndex]?.toFixed(2)}</span>
          )}
        </div>

        {/* Main Interactive Chart Canvas Area */}
        <div className="relative flex-1 bg-[#131722] p-2 select-none overflow-hidden min-h-[360px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${mainChartHeight + (showRSI ? rsiHeight : 0)}`}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoverIndex(null);
              setMousePos(null);
            }}
          >
            <defs>
              {/* Background gradient for area chart */}
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Price Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const p = minPrice + (1 - pct) * priceRange;
              const y = 15 + pct * (mainChartHeight - 30);
              return (
                <g key={pct}>
                  <line
                    x1="20"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#2a2e39"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={chartWidth - 16}
                    y={y + 3}
                    fill="#787b86"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="start"
                  >
                    {p.toFixed(item.price < 2 ? 4 : 2)}
                  </text>
                </g>
              );
            })}

            {/* Volume Bars (rendered in background of main chart) */}
            {showVolume &&
              candles.map((c, i) => {
                const x = getX(i);
                const barHeight = (c.volume / maxVolume) * volumeHeight;
                const y = mainChartHeight - barHeight;
                const isCandleGreen = c.close >= c.open;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={x - 2.5}
                    y={y}
                    width="5"
                    height={barHeight}
                    fill={isCandleGreen ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)'}
                  />
                );
              })}

            {/* Bollinger Bands Envelope */}
            {showBollinger && (
              <path
                d={candles.reduce((acc, _, i) => {
                  const m = ma20[i];
                  if (!m) return acc;
                  const band = m * 0.012;
                  const x = getX(i);
                  const y = getY(m + band);
                  return `${acc} ${acc ? 'L' : 'M'} ${x},${y}`;
                }, '')}
                fill="none"
                stroke="rgba(192, 132, 252, 0.4)"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
            )}

            {/* Candlesticks Rendering */}
            {(chartType === 'candles' || chartType === 'heikin') &&
              candles.map((c, i) => {
                const x = getX(i);
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const isCandleGreen = c.close >= c.open;
                const candleColor = isCandleGreen ? '#089981' : '#f23645';

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(openY - closeY));

                return (
                  <g key={`candle-${i}`}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - 3.5}
                      y={bodyTop}
                      width="7"
                      height={bodyHeight}
                      fill={candleColor}
                      rx="0.5"
                    />
                  </g>
                );
              })}

            {/* Line / Area Rendering */}
            {(chartType === 'line' || chartType === 'area') && (
              <>
                {chartType === 'area' && (
                  <path
                    d={`${candles.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(c.close)}`, '')} L ${getX(candles.length - 1)},${mainChartHeight} L ${getX(0)},${mainChartHeight} Z`}
                    fill="url(#chartAreaGrad)"
                  />
                )}
                <path
                  d={candles.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(c.close)}`, '')}
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Moving Average 20 Line */}
            {showMA20 && (
              <path
                d={candles.reduce((acc, _, i) => {
                  const val = ma20[i];
                  if (val === null) return acc;
                  const x = getX(i);
                  const y = getY(val);
                  return `${acc} ${acc ? 'L' : 'M'} ${x},${y}`;
                }, '')}
                fill="none"
                stroke="#2962ff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}

            {/* Moving Average 50 Line */}
            {showMA50 && (
              <path
                d={candles.reduce((acc, _, i) => {
                  const val = ma50[i];
                  if (val === null) return acc;
                  const x = getX(i);
                  const y = getY(val);
                  return `${acc} ${acc ? 'L' : 'M'} ${x},${y}`;
                }, '')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}

            {/* Secondary Panel: RSI (14) */}
            {showRSI && (
              <g transform={`translate(0, ${mainChartHeight})`}>
                {/* RSI Divider */}
                <line x1="20" y1="0" x2={chartWidth - 20} y2="0" stroke="#363a45" strokeWidth="1" />
                <text x="24" y="14" fill="#787b86" fontSize="9" fontFamily="JetBrains Mono">
                  RSI (14): {hoverIndex !== null && rsiSeries[hoverIndex] ? rsiSeries[hoverIndex]?.toFixed(1) : '56.2'}
                </text>

                {/* Overbought 70 and Oversold 30 reference lines */}
                <line x1="20" y1="25" x2={chartWidth - 20} y2="25" stroke="#f23645" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />
                <text x={chartWidth - 16} y="28" fill="#f23645" fontSize="8" fontFamily="JetBrains Mono">70</text>
                
                <line x1="20" y1="55" x2={chartWidth - 20} y2="55" stroke="#089981" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />
                <text x={chartWidth - 16} y="58" fill="#089981" fontSize="8" fontFamily="JetBrains Mono">30</text>

                {/* RSI Waveform */}
                <path
                  d={candles.reduce((acc, _, i) => {
                    const val = rsiSeries[i];
                    if (val === null) return acc;
                    const x = getX(i);
                    const y = 80 - (val / 100) * 60 - 10;
                    return `${acc} ${acc ? 'L' : 'M'} ${x},${y}`;
                  }, '')}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Interactive Crosshair & Tooltip Overlay */}
            {hoverIndex !== null && mousePos && (
              <g>
                {/* Vertical Crosshair Line */}
                <line
                  x1={getX(hoverIndex)}
                  y1="10"
                  x2={getX(hoverIndex)}
                  y2={mainChartHeight + (showRSI ? rsiHeight : 0)}
                  stroke="#787b86"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />

                {/* Horizontal Crosshair Line */}
                <line
                  x1="20"
                  y1={mousePos.y * (chartWidth / 920)}
                  x2={chartWidth - 20}
                  y2={mousePos.y * (chartWidth / 920)}
                  stroke="#787b86"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />

                {/* Point dot on candle close */}
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(candles[hoverIndex].close)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#2962ff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Bottom Section: TradingView Technical Summary Gauges + Quick Simulation Ticket */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border-t border-[#2a2e39] bg-[#181c27]">
          {/* Col 1: Technical Meter Summary */}
          <div className="p-3.5 rounded-lg bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Technical Analysis</span>
              <span className="text-[11px] text-[#787b86]">1H Interval</span>
            </div>

            {/* 3-Part Technical Speedometer Bar */}
            <div className="my-3 space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#787b86]">Oscillators</span>
                  <span className="font-semibold text-white">Neutral (1 Buy, 1 Sell, 9 Neutral)</span>
                </div>
                <div className="h-2 rounded-full bg-[#131722] overflow-hidden flex">
                  <div className="w-[10%] bg-[#f23645]" />
                  <div className="w-[70%] bg-[#787b86]" />
                  <div className="w-[20%] bg-[#089981]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#787b86]">Moving Averages</span>
                  <span className="font-semibold text-[#089981]">Strong Buy (13 Buy, 1 Neutral)</span>
                </div>
                <div className="h-2 rounded-full bg-[#131722] overflow-hidden flex">
                  <div className="w-[0%] bg-[#f23645]" />
                  <div className="w-[15%] bg-[#787b86]" />
                  <div className="w-[85%] bg-[#089981]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#787b86]">Overall Summary</span>
                  <span className="font-bold text-[#089981]">{item.rating}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#131722] overflow-hidden flex">
                  <div className="w-[5%] bg-[#f23645]" />
                  <div className="w-[25%] bg-[#787b86]" />
                  <div className="w-[70%] bg-[#089981]" />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#787b86] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Calculated based on 26 technical indicators</span>
            </div>
          </div>

          {/* Col 2: Key Financial Profile */}
          <div className="p-3.5 rounded-lg bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Key Statistics</span>
            
            <div className="grid grid-cols-2 gap-2 my-2 text-xs font-mono">
              <div className="p-1.5 rounded bg-[#131722] border border-[#2a2e39]">
                <span className="block text-[10px] text-[#787b86] font-sans">Market Cap</span>
                <span className="text-white font-bold">{item.marketCap || '—'}</span>
              </div>
              <div className="p-1.5 rounded bg-[#131722] border border-[#2a2e39]">
                <span className="block text-[10px] text-[#787b86] font-sans">P/E Ratio</span>
                <span className="text-white font-bold">{item.peRatio ? item.peRatio.toFixed(1) : '—'}</span>
              </div>
              <div className="p-1.5 rounded bg-[#131722] border border-[#2a2e39]">
                <span className="block text-[10px] text-[#787b86] font-sans">Dividend Yield</span>
                <span className="text-white font-bold">{item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : '—'}</span>
              </div>
              <div className="p-1.5 rounded bg-[#131722] border border-[#2a2e39]">
                <span className="block text-[10px] text-[#787b86] font-sans">Sector</span>
                <span className="text-white font-bold font-sans truncate block">{item.sector || item.assetClass.toUpperCase()}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#787b86] line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Col 3: Paper Trading Order Simulator */}
          <div className="p-3.5 rounded-lg bg-[#1e222d] border border-[#2a2e39]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Trading Simulation</span>

            <form onSubmit={handleOrderSubmit} className="mt-2 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'buy'
                      ? 'bg-[#089981] text-white shadow'
                      : 'bg-[#131722] text-[#787b86] hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'sell'
                      ? 'bg-[#f23645] text-white shadow'
                      : 'bg-[#131722] text-[#787b86] hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="text-[#787b86]">Units / Contracts:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2 py-1 rounded bg-[#131722] border border-[#2a2e39] text-white font-mono text-right text-xs focus:outline-none focus:border-[#2962ff]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2a2e39] font-mono">
                <span className="text-[#787b86] font-sans">Est. Execution Value:</span>
                <span className="text-white font-bold">
                  ${(orderQuantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                className={`w-full py-2 rounded text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderSubmitted
                    ? 'bg-[#089981]'
                    : orderSide === 'buy'
                    ? 'bg-[#2962ff] hover:bg-[#1e53e5]'
                    : 'bg-[#f23645] hover:bg-[#d92a38]'
                }`}
              >
                {orderSubmitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Order Executed!</span>
                  </>
                ) : (
                  <span>Place Market {orderSide.toUpperCase()}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
