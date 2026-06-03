"use client";

import { useEffect, useRef } from "react";

type WebGlNode = {
  id: string;
  score: number;
  group: "risk" | "liquidity" | "holders" | "signals" | "source" | "access";
};

export type VlmBrainWebGLPrototypeProps = {
  tokenSymbol: string;
  nodes: WebGlNode[];
  paused?: boolean;
};

/**
 * PASS171 WebGL-ready lane.
 *
 * This component is intentionally NOT imported into the public Shield runtime yet.
 * It proves a build-safe, dependency-free WebGL architecture without adding three.js
 * or changing the current DOM/CSS brain.
 */
export default function VlmBrainWebGLPrototype({
  tokenSymbol,
  nodes,
  paused = true,
}: VlmBrainWebGLPrototypeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    let raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      resize();
      const riskSeed = nodes.reduce((sum, node) => sum + node.score, 0) / Math.max(nodes.length, 1);
      const pulse = 0.025 + Math.min(0.075, riskSeed / 1400);
      gl.clearColor(pulse, pulse * 1.12, pulse * 1.18, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      raf = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(raf);
  }, [nodes, paused, tokenSymbol]);

  return (
    <canvas
      ref={canvasRef}
      className="vlm-brain-webgl-prototype"
      aria-hidden="true"
      data-webgl-prototype="vlm-brain"
      data-token-symbol={tokenSymbol}
    />
  );
}
