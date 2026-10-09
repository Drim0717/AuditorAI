import React, { useState } from 'react';
import { AuditResult } from '../types/lottery';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, CheckCircle2, AlertTriangle, CircleDashed } from 'lucide-react';

interface SheetImageOverlayProps {
  imageSrc: string | null;
  audit: AuditResult | null;
  selectedQuadrantId?: string;
  onSelectQuadrant?: (quadrantId: string) => void;
}

export const SheetImageOverlay: React.FC<SheetImageOverlayProps> = ({
  imageSrc,
  audit,
  selectedQuadrantId,
  onSelectQuadrant,
}) => {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  if (!imageSrc) {
    return (
      <div className="w-full h-80 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <CircleDashed className="w-12 h-12 mb-3 text-slate-300 animate-spin-slow" />
        <span className="font-semibold text-sm text-slate-600">No hay hoja cargada</span>
        <span className="text-xs text-slate-400 mt-1 max-w-xs">
          Toma una foto con la cámara de tu celular, sube una imagen o selecciona un ejemplo de prueba.
        </span>
      </div>
    );
  }

  const quadMap = {
    arriba_izq: audit?.quadrants.find((q) => q.id === 'arriba_izq'),
    arriba_der: audit?.quadrants.find((q) => q.id === 'arriba_der'),
    abajo_izq: audit?.quadrants.find((q) => q.id === 'abajo_izq'),
    abajo_der: audit?.quadrants.find((q) => q.id === 'abajo_der'),
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
      {/* Top Toolbar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50 text-white text-xs">
          <span className="font-semibold text-slate-200">Segmentación 2x2</span>
          {audit && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
              Página {audit.pageNumber}
            </span>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/50 text-white">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showGrid ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Cuadrícula
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Acercar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Alejar"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Restablecer vista"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="w-full max-h-[520px] overflow-auto flex items-center justify-center p-2 bg-slate-950">
        <div
          className="relative transition-transform duration-150 origin-center max-w-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={imageSrc}
            alt="Ticket de lotería"
            className="max-h-[500px] w-auto object-contain rounded shadow-lg block mx-auto"
          />

          {/* 2x2 Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-auto">
              {/* Top Left */}
              <div
                onClick={() => onSelectQuadrant?.('arriba_izq')}
                className={`border-r-2 border-b-2 border-dashed transition-all cursor-pointer p-2 flex flex-col justify-between ${
                  selectedQuadrantId === 'arriba_izq'
                    ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400 ring-inset'
                    : 'border-blue-500/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                    1. Arriba IZQ
                  </span>
                  {quadMap.arriba_izq && !quadMap.arriba_izq.isEmpty && (
                    <span className="bg-emerald-600/90 text-white font-mono font-black text-xs px-2 py-0.5 rounded shadow">
                      ${quadMap.arriba_izq.confirmedTotal}
                    </span>
                  )}
                </div>
                {quadMap.arriba_izq?.lotteries && quadMap.arriba_izq.lotteries.length > 0 && (
                  <div className="text-[10px] bg-slate-900/80 text-blue-300 px-1.5 py-0.5 rounded self-start font-semibold">
                    {quadMap.arriba_izq.lotteries.join(', ')}
                  </div>
                )}
              </div>

              {/* Top Right */}
              <div
                onClick={() => onSelectQuadrant?.('arriba_der')}
                className={`border-b-2 border-dashed transition-all cursor-pointer p-2 flex flex-col justify-between ${
                  selectedQuadrantId === 'arriba_der'
                    ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400 ring-inset'
                    : 'border-blue-500/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                    2. Arriba DER
                  </span>
                  {quadMap.arriba_der && !quadMap.arriba_der.isEmpty && (
                    <span className="bg-emerald-600/90 text-white font-mono font-black text-xs px-2 py-0.5 rounded shadow">
                      ${quadMap.arriba_der.confirmedTotal}
                    </span>
                  )}
                </div>
                {quadMap.arriba_der?.lotteries && quadMap.arriba_der.lotteries.length > 0 && (
                  <div className="text-[10px] bg-slate-900/80 text-blue-300 px-1.5 py-0.5 rounded self-start font-semibold">
                    {quadMap.arriba_der.lotteries.join(', ')}
                  </div>
                )}
              </div>

              {/* Bottom Left */}
              <div
                onClick={() => onSelectQuadrant?.('abajo_izq')}
                className={`border-r-2 border-dashed transition-all cursor-pointer p-2 flex flex-col justify-between ${
                  selectedQuadrantId === 'abajo_izq'
                    ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400 ring-inset'
                    : 'border-blue-500/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                    3. Abajo IZQ
                  </span>
                  {quadMap.abajo_izq && !quadMap.abajo_izq.isEmpty && (
                    <span className="bg-emerald-600/90 text-white font-mono font-black text-xs px-2 py-0.5 rounded shadow">
                      ${quadMap.abajo_izq.confirmedTotal}
                    </span>
                  )}
                </div>
                {quadMap.abajo_izq?.lotteries && quadMap.abajo_izq.lotteries.length > 0 && (
                  <div className="text-[10px] bg-slate-900/80 text-blue-300 px-1.5 py-0.5 rounded self-start font-semibold">
                    {quadMap.abajo_izq.lotteries.join(', ')}
                  </div>
                )}
              </div>

              {/* Bottom Right */}
              <div
                onClick={() => onSelectQuadrant?.('abajo_der')}
                className={`border-dashed transition-all cursor-pointer p-2 flex flex-col justify-between ${
                  selectedQuadrantId === 'abajo_der'
                    ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400 ring-inset'
                    : 'border-blue-500/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                    4. Abajo DER
                  </span>
                  {quadMap.abajo_der && !quadMap.abajo_der.isEmpty && (
                    <span className="bg-emerald-600/90 text-white font-mono font-black text-xs px-2 py-0.5 rounded shadow">
                      ${quadMap.abajo_der.confirmedTotal}
                    </span>
                  )}
                </div>
                {quadMap.abajo_der?.lotteries && quadMap.abajo_der.lotteries.length > 0 && (
                  <div className="text-[10px] bg-slate-900/80 text-blue-300 px-1.5 py-0.5 rounded self-start font-semibold">
                    {quadMap.abajo_der.lotteries.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
