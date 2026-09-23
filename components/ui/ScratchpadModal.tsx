'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Eraser, Trash2, Pen, Undo, Check } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CanvasPointerEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

const STORAGE_KEY = 'ubt-scratchpad-image';
const NOTES_KEY = 'ubt-scratchpad-notes';

const COLORS = ['#18181b', '#2563eb', '#dc2626', '#16a34a'];
const WIDTHS = [1, 3, 6];

export function ScratchpadModal({ isOpen, onClose }: ScratchpadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#18181b');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);
  const [notes, setNotes] = useState(
    'P₀ = 100\nP₁ = 100 * 1.25 = 125\nP₂ = 125 * (1 - 0.20) = 125 * 0.8 = 100\nҚорытынды: Бастапқы баға мен соңғы баға тең (Өзгерген жоқ!)'
  );

  // === Хелпер: получить координаты курсора/тача относительно canvas ===
  const getPos = useCallback((e: CanvasPointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // === Хелпер: получить контекст + canvas ===
  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  }, []);

  // === Инициализация canvas при открытии ===
  useEffect(() => {
    if (!isOpen) return;
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // сброс трансформаций
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Белый фон
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Восстановление сохранённого рисунка
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = saved;
    }

    // Восстановление заметок
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) setNotes(savedNotes);
  }, [isOpen, getCtx]);

  // === Escape для закрытия ===
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // === Сохранение заметок ===
  useEffect(() => {
    if (!isOpen) return;
    localStorage.setItem(NOTES_KEY, notes);
  }, [notes, isOpen]);

  // === Ранний return ПОСЛЕ всех хуков ===
  if (!isOpen) return null;

  // === Сохранение снимка для Undo ===
  const pushHistory = () => {
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack((prev) => [...prev.slice(-20), data]); // ограничение 20 шагов
  };

  // === Рисование ===
  const startDrawing = (e: CanvasPointerEvent) => {
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;

    pushHistory();
    setIsDrawing(true);

    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: CanvasPointerEvent) => {
    if (!isDrawing) return;
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;

    const { x, y } = getPos(e, canvas);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? 16 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // === Очистка ===
  const clearCanvas = () => {
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;

    pushHistory();
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  // === Undo ===
  const undo = () => {
    const pair = getCtx();
    if (!pair) return;
    const { ctx } = pair;

    if (historyStack.length === 0) return;
    const last = historyStack[historyStack.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistoryStack((prev) => prev.slice(0, -1));
  };

  // === Сохранение перед закрытием ===
  const handleClose = () => {
    const pair = getCtx();
    if (pair) {
      try {
        localStorage.setItem(STORAGE_KEY, pair.canvas.toDataURL());
      } catch {
        // localStorage переполнен — игнорируем
      }
    }
    localStorage.setItem(NOTES_KEY, notes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Сандық черновик"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center text-xs font-semibold">
              <Pen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">
                Сандық черновик (Scratchpad)
              </h3>
              <p className="text-xs text-zinc-500">Сызба және есептеу жазбалары</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Жабу"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Canvas drawing tool */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Графикалық сызба
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Pen */}
                <button
                  onClick={() => setIsEraser(false)}
                  aria-label="Қалам"
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    !isEraser
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                  title="Қалам"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>

                {/* Eraser */}
                <button
                  onClick={() => setIsEraser(true)}
                  aria-label="Өшіргіш"
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    isEraser
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                  title="Өшіргіш"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>

                {/* Widths */}
                {!isEraser && (
                  <div className="flex items-center gap-1 ml-1">
                    {WIDTHS.map((w) => (
                      <button
                        key={w}
                        onClick={() => setLineWidth(w)}
                        aria-label={`Қалыңдық ${w}`}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          lineWidth === w
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                        title={`Қалыңдық ${w}px`}
                      >
                        <span
                          className="rounded-full bg-current"
                          style={{ width: w + 2, height: w + 2 }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Colors */}
                {!isEraser && (
                  <div className="flex items-center gap-1 ml-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={`Түс ${c}`}
                        className={`w-4 h-4 rounded-full border border-white transition-transform cursor-pointer ${
                          color === c
                            ? 'scale-125 ring-2 ring-zinc-400'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}

                {/* Undo */}
                <button
                  onClick={undo}
                  disabled={historyStack.length === 0}
                  aria-label="Артқа қайтару"
                  className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-xs font-medium ml-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Артқа қайтару"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>

                {/* Clear */}
                <button
                  onClick={clearCanvas}
                  aria-label="Тазалау"
                  className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 text-xs font-medium cursor-pointer"
                  title="Тазалау"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden h-[300px] relative cursor-crosshair">
              <canvas
                ref={canvasRef}
                aria-label="Сызба аймағы"
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          {/* Text notes */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Мәтіндік жазбалар
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Формула мен есептеу қадамдары..."
              aria-label="Черновик жазбалары"
              className="w-full h-[300px] p-3.5 text-xs font-mono text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-t border-zinc-100">
          <span className="text-xs text-zinc-400">Автоматты сақталады</span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Жабу
          </button>
        </div>
      </div>
    </div>
  );
}