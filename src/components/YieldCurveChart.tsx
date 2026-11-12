import React, { useState } from 'react';
import { YIELD_CURVE_DATA } from '../data/marketData';

export const YieldCurveChart: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<{ maturity: string; yield: number; prevMonth: number } | null>(null);

  const width = 680;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const minY = 4.0;
  const maxY = 5.0;
  const rangeY = maxY - minY;

  const availableWidth = width - paddingX * 2;
  const availableHeight = height - paddingY * 2;

  const getX = (idx: number) => paddingX + (idx / (YIELD_CURVE_DATA.length - 1)) * availableWidth;
  const getY = (val: number) => paddingY + (1 - (val - minY) / rangeY) * availableHeight;

  // Path for current yield curve
  const currentPath = YIELD_CURVE_DATA.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(pt.yield)}`,
    ''
  );

  // Path for 1 month prior
  const prevPath = YIELD_CURVE_DATA.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(pt.prevMonth)}`,
    ''
  );

  return (
    <div className="p-4 rounded-lg bg-[#1e222d] border border-[#2a2e39] space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">US Treasury Yield Curve</h3>
          <p className="text-xs text-[#787b86]">Maturity term structure from 1 Month bills to 30 Year bonds</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2962ff] inline-block" />
            <span className="text-white font-medium">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#787b86] stroke-dasharray inline-block opacity-60" />
            <span className="text-[#787b86]">1 Month Ago</span>
          </div>
        </div>
      </div>

      {/* SVG Yield Curve Graph */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Y-axis guidelines */}
          {[4.0, 4.25, 4.5, 4.75, 5.0].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#2a2e39"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#787b86"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val.toFixed(2)}%
                </text>
              </g>
            );
          })}

          {/* 1 Month Ago Curve */}
          <path
            d={prevPath}
            fill="none"
            stroke="#787b86"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Current Yield Curve */}
          <path
            d={currentPath}
            fill="none"
            stroke="#2962ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {YIELD_CURVE_DATA.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.yield);
            const isHovered = hoveredPoint?.maturity === pt.maturity;

            return (
              <g
                key={pt.maturity}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#ffffff' : '#2962ff'}
                  stroke="#131722"
                  strokeWidth="1.5"
                  className="transition-all"
                />
                <text
                  x={cx}
                  y={height - 10}
                  fill={isHovered ? '#ffffff' : '#787b86'}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {pt.maturity}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover info badge */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 p-2 rounded bg-[#131722] border border-[#2a2e39] text-xs font-mono shadow-lg">
            <span className="font-bold text-white block">{hoveredPoint.maturity} Treasury Yield</span>
            <span className="text-[#2962ff] font-bold">{hoveredPoint.yield.toFixed(2)}%</span>
            <span className="text-[#787b86] ml-2 text-[10px]">(vs {hoveredPoint.prevMonth.toFixed(2)}% last mo)</span>
          </div>
        )}
      </div>
    </div>
  );
};
