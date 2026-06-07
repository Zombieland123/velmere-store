"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type WheelEvent } from "react";

export type AdvancedMarketCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

function compact(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function price(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value < 10 ? 4 : 2,
  }).format(value);
}

export default function AdvancedMarketChart({
  candles,
  locale,
}: {
  candles: AdvancedMarketCandle[];
  locale: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [panOffset, setPanOffset] = useState(0);
  const windowSize = Math.min(48, candles.length);
  const maxOffset = Math.max(0, candles.length - windowSize);
  const safeOffset = Math.min(panOffset, maxOffset);
  const visibleEnd = candles.length - safeOffset;
  const visible = candles.slice(Math.max(0, visibleEnd - windowSize), visibleEnd);
  const width = 980;
  const height = 520;
  const left = 22;
  const right = 76;
  const top = 24;
  const priceBottom = 390;
  const volumeTop = 414;
  const volumeBottom = 482;

  useEffect(() => {
    setPanOffset((current) => Math.min(current, maxOffset));
    setHovered(null);
  }, [candles, maxOffset]);

  const model = useMemo(() => {
    if (visible.length < 2) return null;
    const min = Math.min(...visible.map((candle) => candle.low));
    const max = Math.max(...visible.map((candle) => candle.high));
    const padding = Math.max((max - min) * 0.07, Math.abs(max) * 0.001);
    const low = min - padding;
    const high = max + padding;
    const span = Math.max(high - low, 0.000001);
    const plotWidth = width - left - right;
    const step = plotWidth / visible.length;
    const y = (value: number) => top + ((high - value) / span) * (priceBottom - top);
    const maxVolume = Math.max(...visible.map((candle) => candle.volume || 0), 1);
    const movingAverage = visible.map((_, index) => {
      const start = Math.max(0, index - 8);
      const slice = visible.slice(start, index + 1);
      return slice.reduce((sum, candle) => sum + candle.close, 0) / slice.length;
    });
    const movingPath = movingAverage
      .map((value, index) => `${index ? "L" : "M"} ${left + index * step + step / 2} ${y(value)}`)
      .join(" ");
    return { low, high, step, y, maxVolume, movingPath };
  }, [visible]);

  if (!model) return null;
  const chartModel = model;
  const selected = visible[hovered ?? visible.length - 1];
  const selectedX = left + (hovered ?? visible.length - 1) * chartModel.step + chartModel.step / 2;
  const selectedY = chartModel.y(selected.close);

  function onMove(event: MouseEvent<SVGSVGElement>) {
    if (dragRef.current) return;
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    const index = Math.max(0, Math.min(visible.length - 1, Math.floor((x - left) / chartModel.step)));
    setHovered(index);
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || maxOffset === 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: safeOffset,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const candleDelta = Math.round(((event.clientX - drag.startX) / Math.max(bounds.width, 1)) * windowSize);
    // Natural terminal pan: dragging right moves the visible chart right; dragging left moves it left.
    setPanOffset(Math.max(0, Math.min(maxOffset, drag.startOffset - candleDelta)));
    setHovered(null);
  }

  function endPointer(event: PointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onWheel(event: WheelEvent<SVGSVGElement>) {
    if (!maxOffset) return;
    event.preventDefault();
    const direction = event.deltaY > 0 || event.deltaX > 0 ? 1 : -1;
    setPanOffset((current) => Math.max(0, Math.min(maxOffset, current + direction * 4)));
    setHovered(null);
  }

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-[#06090a]">
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-white/[0.07] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.11em] text-white/[0.42]">
        <span>O <b className="text-white/[0.76]">{price(selected.open)}</b></span>
        <span>H <b className="text-emerald-200/[0.76]">{price(selected.high)}</b></span>
        <span>L <b className="text-rose-200/[0.76]">{price(selected.low)}</b></span>
        <span>C <b className="text-cyan-100/[0.82]">{price(selected.close)}</b></span>
        <span>VOL <b className="text-white/[0.68]">{selected.volume ? compact(selected.volume) : "—"}</b></span>
        <time className="ml-auto">{new Date(selected.timestamp * 1000).toLocaleString(locale)}</time>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full touch-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Interactive source-bound candlestick chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={onWheel}
        onContextMenu={(event) => event.preventDefault()}
      >
        <defs>
          <linearGradient id="market-chart-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(27,204,255,.10)" />
            <stop offset="100%" stopColor="rgba(27,204,255,0)" />
          </linearGradient>
          <filter id="market-chart-glow">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="#06090a" />
        {[0, 1, 2, 3, 4].map((line) => {
          const lineY = top + ((priceBottom - top) / 4) * line;
          const value = chartModel.high - ((chartModel.high - chartModel.low) / 4) * line;
          return (
            <g key={line}>
              <line x1={left} x2={width - right} y1={lineY} y2={lineY} stroke="rgba(255,255,255,.065)" strokeDasharray="4 7" />
              <text x={width - right + 12} y={lineY + 4} fill="rgba(255,255,255,.34)" fontSize="11" fontFamily="monospace">{price(value)}</text>
            </g>
          );
        })}
        {Array.from({ length: 8 }, (_, index) => {
          const x = left + ((width - left - right) / 8) * index;
          return <line key={x} x1={x} x2={x} y1={top} y2={volumeBottom} stroke="rgba(255,255,255,.035)" />;
        })}
        <path d={chartModel.movingPath} fill="none" stroke="rgba(200,169,106,.65)" strokeWidth="1.5" />
        {visible.map((candle, index) => {
          const x = left + index * chartModel.step + chartModel.step / 2;
          const rising = candle.close >= candle.open;
          const color = rising ? "#25dbb1" : "#ff4e78";
          const bodyTop = chartModel.y(Math.max(candle.open, candle.close));
          const bodyBottom = chartModel.y(Math.min(candle.open, candle.close));
          const volumeHeight = ((candle.volume || 0) / chartModel.maxVolume) * (volumeBottom - volumeTop);
          return (
            <g key={`${candle.timestamp}-${index}`} opacity={hovered === null || hovered === index ? 1 : 0.72}>
              <line x1={x} x2={x} y1={chartModel.y(candle.high)} y2={chartModel.y(candle.low)} stroke={color} strokeWidth="1" />
              <rect
                x={x - Math.max(1.5, chartModel.step * 0.3)}
                y={bodyTop}
                width={Math.max(2.6, chartModel.step * 0.6)}
                height={Math.max(1.8, bodyBottom - bodyTop)}
                fill={rising ? color : "#090c0d"}
                stroke={color}
                strokeWidth="1"
                rx=".8"
              />
              <rect
                x={x - Math.max(1.5, chartModel.step * 0.3)}
                y={volumeBottom - volumeHeight}
                width={Math.max(2.6, chartModel.step * 0.6)}
                height={volumeHeight}
                fill={rising ? "rgba(37,219,177,.34)" : "rgba(255,78,120,.34)"}
              />
            </g>
          );
        })}
        <line x1={left} x2={width - right} y1={selectedY} y2={selectedY} stroke="rgba(104,221,255,.35)" strokeDasharray="3 5" />
        <line x1={selectedX} x2={selectedX} y1={top} y2={volumeBottom} stroke="rgba(104,221,255,.42)" strokeDasharray="3 5" />
        <circle cx={selectedX} cy={selectedY} r="3.5" fill="#b4f2ff" filter="url(#market-chart-glow)" />
        <text x={left} y={507} fill="rgba(255,255,255,.28)" fontSize="10" fontFamily="monospace">OHLC · VOLUME · NATURAL DRAG · NO FAKE CANDLES</text>
      </svg>
    </div>
  );
}
