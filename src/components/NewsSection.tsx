import React from 'react';
import { NewsArticle, MarketSector, MarketItem } from '../types/market';
import { ExternalLink, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

interface NewsSectionProps {
  news: NewsArticle[];
  sectors: MarketSector[];
  onSelectSymbol: (symbol: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, sectors, onSelectSymbol }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Col 1 & 2: Breaking Market News Feed */}
      <div className="lg:col-span-2 rounded-lg bg-[#1e222d] border border-[#2a2e39] p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#2962ff]" />
            <h3 className="text-sm font-bold text-white tracking-tight">Market News & Editorial Insights</h3>
          </div>
          <span className="text-xs text-[#787b86]">Live updates</span>
        </div>

        <div className="divide-y divide-[#2a2e39]/60">
          {news.map((item) => (
            <article key={item.id} className="py-3.5 first:pt-0 last:pb-0 group">
              <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1">
                <span className="font-semibold text-white">{item.source}</span>
                <span aria-hidden="true">·</span>
                <span>{item.time}</span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-[#2962ff] transition-colors cursor-pointer leading-snug">
                {item.title}
              </h4>

              <p className="text-xs text-[#787b86] mt-1 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>

              {/* Related symbol chips */}
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] text-[#787b86]">Mentions:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => onSelectSymbol(sym)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131722] hover:bg-[#2962ff] text-[#d1d4dc] hover:text-white border border-[#2a2e39] transition-colors cursor-pointer"
                    >
                      ${sym}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Col 3: S&P 500 Sector Performance */}
      <div className="rounded-lg bg-[#1e222d] border border-[#2a2e39] p-4 space-y-3">
        <div className="border-b border-[#2a2e39] pb-3">
          <h3 className="text-sm font-bold text-white tracking-tight">Sector Performance</h3>
          <p className="text-xs text-[#787b86] mt-0.5">S&P 500 GICS Sector daily returns</p>
        </div>

        <div className="space-y-2.5 text-xs">
          {sectors.map((sec) => {
            const isPos = sec.performance >= 0;
            return (
              <div key={sec.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate max-w-[150px]">{sec.name}</span>
                  <div
                    className={`flex items-center gap-1 font-mono font-bold ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPos ? '+' : ''}{sec.performance.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#787b86]">
                  <span>Leader: <span className="text-[#d1d4dc]">{sec.topStock}</span></span>
                  <span>{sec.marketCap}</span>
                </div>

                {/* Performance bar */}
                <div className="h-1 bg-[#131722] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${isPos ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                    style={{ width: `${Math.min(100, Math.abs(sec.performance) * 35)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
