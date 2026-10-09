import React, { useState } from 'react';
import { QuadrantAudit, PlayItem } from '../types/lottery';
import {
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  Edit3,
  Save,
  X,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { getMasterLotteries } from '../utils/lotteryMasterCatalog';

interface QuadrantCardProps {
  quadrant: QuadrantAudit;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateQuadrant?: (updated: QuadrantAudit) => void;
}

export const QuadrantCard: React.FC<QuadrantCardProps> = ({
  quadrant,
  isSelected,
  onSelect,
  onUpdateQuadrant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllPlays, setShowAllPlays] = useState(false);
  const [showCorrectionMenu, setShowCorrectionMenu] = useState<string | null>(null);

  const masterList = getMasterLotteries();

  const [editPlaysText, setEditPlaysText] = useState(
    quadrant.plays.map((p) => p.raw || `${p.number}-${p.amount}`).join('\n')
  );
  const [editLotteries, setEditLotteries] = useState(quadrant.lotteries.join(', '));
  const [editCircle, setEditCircle] = useState(quadrant.declaredCircleTotal?.toString() || '');

  if (quadrant.isEmpty) {
    return (
      <div
        onClick={onSelect}
        className={`p-4 rounded-xl border-2 border-dashed transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200 bg-slate-50/60'
        } flex flex-col items-center justify-center min-h-[160px] text-center`}
      >
        <CircleDashed className="w-8 h-8 text-slate-400 mb-2" />
        <span className="font-semibold text-slate-600 text-sm">{quadrant.name}</span>
        <span className="text-xs text-slate-400 mt-1">Cuadrante Vacío (Sin jugadas ni marcas)</span>
        <span className="text-xs font-mono font-bold text-slate-400 mt-2">Venta: $0</span>
      </div>
    );
  }

  // Quick fix for an invalid lottery
  const handleApplyLotteryCorrection = (originalInvalid: string, correctedCode: string) => {
    if (!onUpdateQuadrant) return;

    const updatedLots = quadrant.lotteries.map((l) => (l === originalInvalid ? correctedCode : l));
    const uniqueLots = Array.from(new Set(updatedLots));
    const mult = Math.max(1, uniqueLots.length);
    const newCalc = quadrant.subtotalPlays * mult;
    const confirmed = quadrant.declaredCircleTotal !== null && quadrant.declaredCircleTotal === newCalc
      ? newCalc
      : newCalc;

    onUpdateQuadrant({
      ...quadrant,
      lotteries: uniqueLots,
      lotteryMultiplier: mult,
      calculatedTotal: newCalc,
      confirmedTotal: confirmed,
      hasInvalidLottery: false,
      invalidLotteriesList: [],
      notes: `Lotería corregida a ${correctedCode}`,
    });

    setShowCorrectionMenu(null);
  };

  const handleSaveEdit = () => {
    if (!onUpdateQuadrant) return;

    const newLots = editLotteries
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const lines = editPlaysText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedPlays: PlayItem[] = lines.map((l) => {
      const match = l.match(/^([0-9xX]+)[\s\-=/]+([0-9.]+)/);
      if (match) {
        return {
          number: match[1],
          amount: parseFloat(match[2]) || 0,
          raw: l,
          confidence: 'high',
        };
      }
      return { number: l, amount: 0, raw: l, confidence: 'medium' };
    });

    const subtotal = parsedPlays.reduce((acc, p) => acc + p.amount, 0);
    const mult = Math.max(1, newLots.length);
    const calc = subtotal * mult;
    const circleVal = editCircle ? parseFloat(editCircle) : null;

    let confirmed = calc;
    let status: QuadrantAudit['verificationStatus'] = 'match';

    if (circleVal !== null) {
      if (calc === circleVal) {
        status = 'match';
        confirmed = calc;
      } else {
        status = 'override_sum';
        confirmed = calc;
      }
    }

    onUpdateQuadrant({
      ...quadrant,
      lotteries: newLots,
      plays: parsedPlays,
      subtotalPlays: subtotal,
      lotteryMultiplier: mult,
      calculatedTotal: calc,
      declaredCircleTotal: circleVal,
      confirmedTotal: confirmed,
      verificationStatus: status,
      hasInvalidLottery: false,
      invalidLotteriesList: [],
      notes: 'Editado manualmente por el auditor',
    });

    setIsEditing(false);
  };

  const visiblePlays = showAllPlays ? quadrant.plays : quadrant.plays.slice(0, 5);

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 transition-all bg-white shadow-sm flex flex-col ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
          : quadrant.hasInvalidLottery
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm tracking-wide">
              {quadrant.name}
            </span>

            {quadrant.verificationStatus === 'match' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Coincide 100%
              </span>
            )}
            {quadrant.verificationStatus === 'override_sum' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Suma Individual
              </span>
            )}
            {quadrant.verificationStatus === 'override_circle' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <AlertTriangle className="w-3 h-3 text-indigo-600" />
                Total Círculo
              </span>
            )}

            {/* OCR handwriting confidence */}
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
              OCR: {quadrant.overallHandwritingConfidence === 'high' ? 'Alta Precisión' : 'Trazo Complejo'}
            </span>
          </div>

          {/* Loterías detectadas con validación contra la lista maestra */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Loterías:</span>
            {quadrant.lotteries.length > 0 ? (
              quadrant.lotteries.map((lott, idx) => {
                const valObj = quadrant.validatedLotteries?.find(
                  (v) => v.code === lott || v.originalCode === lott
                );
                const isInvalid = valObj ? !valObj.isValid : false;

                return (
                  <div key={idx} className="relative inline-block">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInvalid) {
                          setShowCorrectionMenu(showCorrectionMenu === lott ? null : lott);
                        }
                      }}
                      className={`px-2 py-0.5 rounded-md font-semibold text-xs border flex items-center gap-1 transition-colors ${
                        isInvalid
                          ? 'bg-amber-100 text-amber-900 border-amber-400 cursor-pointer hover:bg-amber-200 ring-1 ring-amber-300'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {lott}
                      {isInvalid ? (
                        <span title="Código no reconocido en la lista maestra. Toca para corregir.">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        </span>
                      ) : (
                        <Check className="w-2.5 h-2.5 text-blue-600" />
                      )}
                    </span>

                    {/* Correction popover if invalid */}
                    {showCorrectionMenu === lott && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[200px] text-xs space-y-1.5 animate-fade-in"
                      >
                        <div className="font-bold text-slate-800 text-[11px] flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>Corregir "{lott}"</span>
                          <button
                            onClick={() => setShowCorrectionMenu(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {valObj?.suggestedMatch && (
                          <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-[10px] text-blue-700 block font-semibold">
                              Sugerencia más cercana:
                            </span>
                            <button
                              onClick={() =>
                                handleApplyLotteryCorrection(lott, valObj.suggestedMatch!)
                              }
                              className="w-full text-left font-bold text-blue-900 hover:underline flex items-center justify-between mt-0.5"
                            >
                              <span>{valObj.suggestedMatch}</span>
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-sans">
                                Aplicar
                              </span>
                            </button>
                          </div>
                        )}

                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          O elige de la lista maestra:
                        </span>
                        <div className="max-h-28 overflow-y-auto space-y-1">
                          {masterList.slice(0, 10).map((m) => (
                            <button
                              key={m.code}
                              onClick={() => handleApplyLotteryCorrection(lott, m.code)}
                              className="w-full text-left px-1.5 py-1 rounded hover:bg-slate-100 font-mono text-[11px] flex items-center justify-between"
                            >
                              <span>{m.code}</span>
                              <span className="text-[10px] text-slate-400 font-sans">{m.region}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-amber-600 font-medium">Ninguna marcada</span>
            )}
            {quadrant.lotteryMultiplier > 1 && (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                x{quadrant.lotteryMultiplier}
              </span>
            )}
          </div>

          {/* Invalid lottery alert notice */}
          {quadrant.hasInvalidLottery && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Código no validado en la lista maestra. Toca la etiqueta para corregir.</span>
            </div>
          )}
        </div>

        {/* Total Venta Confirmada Badge */}
        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Venta Confirmada</div>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
            ${quadrant.confirmedTotal}
          </div>
        </div>
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <div className="mt-3 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Loterías marcadas (separadas por coma):
            </label>
            <input
              type="text"
              value={editLotteries}
              onChange={(e) => setEditLotteries(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jugadas manuscritas (una por línea, ej: 22-5, 50x22=1):
            </label>
            <textarea
              rows={4}
              value={editPlaysText}
              onChange={(e) => setEditPlaysText(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Número dentro del Círculo:
            </label>
            <input
              type="number"
              value={editCircle}
              onChange={(e) => setEditCircle(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-1 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Guardar y Recalcular
            </button>
          </div>
        </div>
      ) : (
        /* Regular View */
        <div className="mt-2.5 flex-1 flex flex-col justify-between">
          {/* Plays breakdown list with handwriting recognition confidence */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>Jugadas extraídas ({quadrant.plays.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold text-[11px]"
              >
                <Edit3 className="w-3 h-3" /> Editar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5">
              {visiblePlays.map((play, pIdx) => (
                <div
                  key={pIdx}
                  className={`px-2 py-1 rounded border text-xs font-mono flex items-center justify-between ${
                    play.isWinner
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">{play.raw || `${play.number}-${play.amount}`}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">${play.amount}</span>
                    {play.confidence === 'high' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Alta confianza OCR" />
                    )}
                  </div>
                  {play.isWinner && (
                    <span className="text-[10px] text-amber-800 bg-amber-200 px-1 rounded ml-1 font-sans">
                      ¡Ganó ${play.prizeAmount}!
                    </span>
                  )}
                </div>
              ))}
            </div>

            {quadrant.plays.length > 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllPlays(!showAllPlays);
                }}
                className="mt-1 text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
              >
                {showAllPlays ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Ver menos jugadas
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Ver todas ({quadrant.plays.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Verification comparison bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Suma Individual
              </span>
              <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                ${quadrant.subtotalPlays}
                {quadrant.lotteryMultiplier > 1 && (
                  <span className="text-xs text-slate-500 font-normal">
                    {' '}
                    x {quadrant.lotteryMultiplier} = ${quadrant.calculatedTotal}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Círculo Manuscrito
              </span>
              <div className="font-mono font-bold text-blue-700 text-sm mt-0.5 flex items-center gap-1">
                <span className="inline-block w-4 h-4 rounded-full border border-blue-600 text-center text-[10px] leading-3.5">
                  ○
                </span>
                {quadrant.declaredCircleTotal !== null ? `$${quadrant.declaredCircleTotal}` : 'No detectado'}
              </div>
            </div>
          </div>

          {/* Prize status */}
          <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium text-[11px]">Premio:</span>
            </div>
            <span className="font-semibold text-slate-700 text-xs">
              {quadrant.prizeNote || '(Esperando números)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
