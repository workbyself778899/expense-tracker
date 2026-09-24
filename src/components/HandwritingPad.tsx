"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Check,
  X,
  Palette,
} from "lucide-react";

interface HandwritingPadProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  inline?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
}

const PEN_COLORS = [
  { name: "White", value: "#f8fafc" },
  { name: "Neon Blue", value: "#38bdf8" },
  { name: "Emerald", value: "#34d399" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Rose", value: "#fb7185" },
  { name: "Purple", value: "#c084fc" },
  { name: "Dark Slate", value: "#0f172a" },
];

const PEN_SIZES = [
  { label: "Fine", value: 2 },
  { label: "Medium", value: 4 },
  { label: "Marker", value: 8 },
];

export default function HandwritingPad({
  initialDataUrl,
  onSave,
  onCancel,
  inline = false,
}: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#38bdf8");
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  // Redraw all strokes onto canvas
  const redrawAll = useCallback(
    (strokeList: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark background for crisp sketching
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid dots for handwriting guidance
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      const dotSpacing = 24;
      for (let x = 12; x < canvas.width; x += dotSpacing) {
        for (let y = 12; y < canvas.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw all recorded strokes
      strokeList.forEach((stroke) => {
        if (stroke.points.length < 1) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.isEraser ? "#0f172a" : stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    },
    []
  );

  // Setup canvas size responsive to parent container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 500;
    const height = Math.min(width * 0.65, 360);

    canvas.width = width;
    canvas.height = Math.max(height, 260);

    if (initialDataUrl && initialDataUrl.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = initialDataUrl;
    } else {
      redrawAll([]);
    }
  }, [initialDataUrl, redrawAll]);

  // Coordinates helper supporting touch & mouse
  const getCanvasCoords = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ("touches" in e) {
      // Prevents page scrolling on mobile while writing!
      e.stopPropagation();
    }
    const pt = getCanvasCoords(e);
    if (!pt) return;

    setIsDrawing(true);
    setCurrentStroke([pt]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = isEraser ? "#0f172a" : selectedColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pt.x, pt.y);
    }
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    if ("touches" in e) {
      e.stopPropagation();
    }
    const pt = getCanvasCoords(e);
    if (!pt) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    setCurrentStroke((prev) => [...prev, pt]);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: selectedColor,
        size: penSize,
        isEraser,
      };
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      setCurrentStroke([]);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redrawAll(updated);
  };

  const handleClear = () => {
    setStrokes([]);
    redrawAll([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md ${
        inline ? "w-full" : "w-full max-w-2xl mx-auto"
      }`}
    >
      {/* Top Bar: Tool Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Pen / Eraser toggle */}
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              !isEraser
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              isEraser
                ? "bg-amber-600 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          {/* Pen Sizes */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 ml-1 border border-slate-700/50">
            {PEN_SIZES.map((sz) => (
              <button
                key={sz.label}
                type="button"
                onClick={() => setPenSize(sz.value)}
                className={`px-2 py-1 text-xs rounded transition ${
                  penSize === sz.value
                    ? "bg-slate-700 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>

          {/* Color Palettes */}
          {!isEraser && (
            <div className="flex items-center gap-1 ml-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50">
              <Palette className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              {PEN_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-5 h-5 rounded-full border transition transform hover:scale-110 ${
                    selectedColor === c.value
                      ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900 border-white"
                      : "border-slate-700"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Undo / Clear Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
            title="Undo stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/50 transition"
            title="Clear canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas Area with Mobile Touch Action */}
      <div className="relative overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="handwriting-canvas w-full block cursor-crosshair"
        />

        {strokes.length === 0 && !initialDataUrl && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500/60 text-xs gap-1 select-none">
            <PenTool className="w-6 h-6 stroke-[1.5]" />
            <span>Draw, scribble or handwrite notes here (mobile & touch ready)</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-800">
        <p className="text-[11px] text-slate-500 flex-1 hidden sm:block">
          ✍️ Draw with finger or stylus — touch &amp; pressure ready
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] border border-white/[0.08] transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
