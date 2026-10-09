import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Wifi,
  Battery,
  Signal,
  Copy,
  Share2,
  Check,
  RefreshCw,
  AlertTriangle,
  Database,
  X,
} from 'lucide-react';
import { AuditResult, QuadrantAudit } from '../types/lottery';
import { getMasterLotteries } from '../utils/lotteryMasterCatalog';

interface AndroidFrameProps {
  audit: AuditResult | null;
  isProcessing: boolean;
  onTriggerCamera: () => void;
  onTriggerGallery: () => void;
  onCopyFormatted: () => void;
  isCopied: boolean;
  onUpdateQuadrant?: (updated: QuadrantAudit) => void;
  children?: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  audit,
  isProcessing,
  onTriggerCamera,
  onTriggerGallery,
  onCopyFormatted,
  isCopied,
  onUpdateQuadrant,
  children,
}) => {
  const [activeFixQuadrant, setActiveFixQuadrant] = useState<QuadrantAudit | null>(null);
  const masterList = getMasterLotteries();

  const handleFixLottery = (quad: QuadrantAudit, invalidCode: string, newCode: string) => {
    if (!onUpdateQuadrant) return;

    const updatedLots = quad.lotteries.map((l) => (l === invalidCode ? newCode : l));
    const uniqueLots = Array.from(new Set(updatedLots));
    const mult = Math.max(1, uniqueLots.length);
    const newCalc = quad.subtotalPlays * mult;
    const confirmed = quad.declaredCircleTotal !== null && quad.declaredCircleTotal === newCalc
      ? newCalc
      : newCalc;

    onUpdateQuadrant({
      ...quad,
      lotteries: uniqueLots,
      lotteryMultiplier: mult,
      calculatedTotal: newCalc,
      confirmedTotal: confirmed,
      hasInvalidLottery: false,
      invalidLotteriesList: [],
      notes: `Corregido en app Android a ${newCode}`,
    });

    setActiveFixQuadrant(null);
  };

  const invalidQuadrants = audit?.quadrants.filter((q) => q.hasInvalidLottery) || [];

  return (
    <div className="relative mx-auto w-full max-w-[390px] rounded-[44px] p-3.5 bg-slate-900 shadow-2xl ring-1 ring-slate-800">
      {/* Speaker and Front Camera notch */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end pr-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
      </div>

      {/* Screen Area */}
      <div className="relative bg-slate-50 rounded-[34px] overflow-hidden min-h-[740px] flex flex-col border border-slate-200">
        {/* Android Status Bar */}
        <div className="h-10 bg-slate-900 text-white px-6 pt-1 flex items-center justify-between text-xs font-medium select-none z-20">
          <span>11:11</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* App Bar (Material You style) */}
        <div className="bg-blue-600 text-white px-4 py-3 shadow flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-1.5">
              <span>LotoAudit</span>
              <span className="text-[10px] bg-blue-500/80 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Android
              </span>
            </h1>
            <p className="text-[11px] text-blue-100">OCR Caligráfico & Validación 2x2</p>
          </div>

          {audit && (
            <button
              onClick={onCopyFormatted}
              className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
              title="Copiar resultado"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Android Screen Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          {children}

          {/* Android Warning Notification: Invalid Lottery Detected */}
          {invalidQuadrants.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900 text-xs">
                    Código de lotería no reconocido
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    El Paso 2 detectó un código que no está en la Lista Maestra. Toca para corregir:
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {invalidQuadrants.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{q.name}: </span>
                      <span className="font-mono text-rose-600 font-bold">
                        {q.invalidLotteriesList?.join(', ') || q.lotteries.join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveFixQuadrant(q)}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-2xs"
                    >
                      Corregir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Android Modal / Sheet for Correction */}
          {activeFixQuadrant && (
            <div className="bg-white rounded-2xl p-3.5 border-2 border-blue-500 shadow-lg space-y-2.5 animate-slide-down">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-xs">
                  Seleccionar Lotería Válida ({activeFixQuadrant.name})
                </span>
                <button
                  onClick={() => setActiveFixQuadrant(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Elige el código canónico de la Lista Maestra:
              </p>

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {masterList.map((m) => (
                  <button
                    key={m.code}
                    onClick={() =>
                      handleFixLottery(
                        activeFixQuadrant,
                        activeFixQuadrant.invalidLotteriesList?.[0] || activeFixQuadrant.lotteries[0],
                        m.code
                      )
                    }
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 font-mono text-left text-xs font-bold text-slate-800 flex items-center justify-between"
                  >
                    <span>{m.code}</span>
                    <span className="text-[9px] text-slate-400 font-sans">{m.region}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result Card styled exactly as the Android spec in the prompt */}
          {audit ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-slate-900 text-base">
                  Página {audit.pageNumber}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Auditada
                </span>
              </div>

              {/* Quadrant lines */}
              <div className="mt-3 space-y-2 text-xs font-mono">
                {audit.quadrants.map((q) => {
                  if (q.isEmpty) {
                    return (
                      <div
                        key={q.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400"
                      >
                        <span className="font-bold text-slate-500">{q.name}:</span> Vacío
                      </div>
                    );
                  }
                  return (
                    <div
                      key={q.id}
                      className={`p-2 rounded-lg border text-slate-800 space-y-1 ${
                        q.hasInvalidLottery
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700">{q.name}:</span>
                        <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Venta: ${q.confirmedTotal}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          Loterías: {q.lotteries.join(', ') || 'N/A'}
                          {q.hasInvalidLottery && (
                            <span className="text-rose-600 font-bold text-[10px]">⚠️ Error</span>
                          )}
                        </span>
                        <span className="text-slate-500 font-sans">
                          Premio: {q.prizeNote || '(Esperando números)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total sale footer */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">Venta Total:</span>
                <span className="font-mono font-black text-xl text-blue-600">
                  ${audit.totalPageSale}
                </span>
              </div>

              {/* Quick WhatsApp Share Button */}
              <button
                onClick={() => {
                  const text = encodeURIComponent(audit.formattedOutput);
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir por WhatsApp
              </button>
            </div>
          ) : isProcessing ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">El "Cerebro" de la IA analizando...</div>
              <p className="text-xs text-slate-500 mt-1">
                OCR caligráfico, validando contra Lista Maestra y verificando matemática.
              </p>
            </div>
          ) : null}
        </div>

        {/* Android Floating Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-center gap-3 z-30">
          <button
            onClick={onTriggerGallery}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-slate-500" /> Galería
          </button>

          <button
            onClick={onTriggerCamera}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" /> Tomar Foto
          </button>
        </div>
      </div>
    </div>
  );
};
