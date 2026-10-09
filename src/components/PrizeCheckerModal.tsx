import React, { useState } from 'react';
import { Award, X, Check, RotateCcw, AlertCircle } from 'lucide-react';

interface PrizeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningNumbers: Record<string, string>;
  onSaveWinningNumbers: (numbers: Record<string, string>) => void;
  availableLotteries: string[];
}

const COMMON_LOTTERIES = [
  'NY AM',
  'NY PM',
  'FL AM',
  'FL PM',
  'GA AM',
  'GA EVE',
  'MD AM',
  'MD PM',
  'NJ AM',
];

export const PrizeCheckerModal: React.FC<PrizeCheckerModalProps> = ({
  isOpen,
  onClose,
  winningNumbers,
  onSaveWinningNumbers,
  availableLotteries,
}) => {
  const [localNumbers, setLocalNumbers] = useState<Record<string, string>>(winningNumbers);

  if (!isOpen) return null;

  // Merge unique lotteries
  const allLotteries = Array.from(new Set([...COMMON_LOTTERIES, ...availableLotteries]));

  const handleChange = (lottery: string, val: string) => {
    setLocalNumbers((prev) => ({
      ...prev,
      [lottery]: val,
    }));
  };

  const handleClear = () => {
    setLocalNumbers({});
  };

  const handleSave = () => {
    // Clean empty values
    const cleaned: Record<string, string> = {};
    Object.entries(localNumbers).forEach(([k, v]) => {
      if (v?.trim()) cleaned[k] = v.trim();
    });
    onSaveWinningNumbers(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Control de Premios / Números Ganadores
              </h3>
              <p className="text-xs text-slate-500">
                Ingresa los números ganadores del día para comprobar aciertos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info callout */}
        <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Al ingresar un número ganador (ej. <strong>22</strong> o <strong>77</strong>), el auditor
            verificará automáticamente las jugadas de cada cuadrante y calculará el pago por quiniela o palé,
            actualizando el campo <code>Premio: (Esperando números)</code>.
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
          {allLotteries.map((lottery) => (
            <div key={lottery} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {lottery}
              </label>
              <input
                type="text"
                placeholder="Ej. 22"
                maxLength={4}
                value={localNumbers[lottery] || ''}
                onChange={(e) => handleChange(lottery, e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Borrar todo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Aplicar y Comprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
