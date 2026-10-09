import React, { useState } from 'react';
import { AuditResult } from '../types/lottery';
import {
  Brain,
  LayoutGrid,
  CheckSquare,
  Hash,
  CircleDot,
  Scale,
  ChevronDown,
  ChevronUp,
  Database,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

interface BrainStepVisualizerProps {
  audit: AuditResult | null;
  isProcessing?: boolean;
}

export const BrainStepVisualizer: React.FC<BrainStepVisualizerProps> = ({
  audit,
  isProcessing,
}) => {
  const [showPensamiento, setShowPensamiento] = useState(false);

  const steps = [
    {
      num: 1,
      name: 'Segmentación Espacial',
      subtitle: 'Cuadrícula 2x2',
      icon: LayoutGrid,
      color: 'blue',
      detail: 'Mapea la imagen en 4 cuadrantes (Arriba IZQ, Arriba DER, Abajo IZQ, Abajo DER). Descarta automáticamente cuadrantes vacíos.',
      summary: audit
        ? `${audit.quadrants.filter((q) => !q.isEmpty).length} cuadrantes activos, ${
            audit.quadrants.filter((q) => q.isEmpty).length
          } vacíos.`
        : 'Esperando imagen...',
    },
    {
      num: 2,
      name: 'Extracción & Validación',
      subtitle: 'Filtro Lista Maestra',
      icon: Database,
      color: 'indigo',
      detail: 'Escanea casillas marcadas con bolígrafo y valida estrictamente cada código contra la Base de Datos Maestra de Loterías Válidas (NY AM, FL AM, etc.).',
      summary: audit
        ? audit.hasLotteryValidationWarnings
          ? '⚠️ Se detectaron códigos que requieren revisión'
          : '✓ Todos los códigos validados en lista maestra'
        : 'Pendiente de escaneo...',
    },
    {
      num: 3,
      name: 'OCR de Escritura Manual',
      subtitle: 'Números & Montos',
      icon: Hash,
      color: 'emerald',
      detail: 'Distingue caligrafía cursiva, 1 europeo con gancho vs 7 cruzado, 0 vs 6/8, trazos gruesos/tenues y separadores (-, =, /, x). Multiplica por loterías válidas.',
      summary: audit
        ? `Total de jugadas extraídas: ${audit.quadrants.reduce(
            (acc, q) => acc + q.plays.length,
            0
          )} con alta fidelidad.`
        : 'Pendiente de escaneo...',
    },
    {
      num: 4,
      name: 'Detección del Círculo',
      subtitle: 'Total Declarado',
      icon: CircleDot,
      color: 'amber',
      detail: 'Escanea la parte inferior/lateral buscando círculos manuscritos y extrae el número declarado por el vendedor.',
      summary: audit
        ? audit.quadrants
            .filter((q) => !q.isEmpty)
            .map((q) => `${q.name}: ○${q.declaredCircleTotal ?? 'N/A'}`)
            .join(' | ')
        : 'Pendiente de escaneo...',
    },
    {
      num: 5,
      name: 'Doble Verificación',
      subtitle: 'Regla de Oro Matemática',
      icon: Scale,
      color: 'violet',
      detail: 'Compara: ¿Suma Individual == Círculo? Resuelve discrepancias dando prioridad a la suma si las jugadas son nítidas o al círculo si hay borrones.',
      summary: audit
        ? `Venta Total Confirmada: $${audit.totalPageSale}`
        : 'Pendiente de verificación...',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              El "Cerebro" de la IA con OCR Caligráfico
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Lista Maestra Integrada
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Reconocimiento de escritura manual, validación de códigos de lotería y doble verificación
            </p>
          </div>
        </div>

        {audit?.pensamiento && (
          <button
            onClick={() => setShowPensamiento(!showPensamiento)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Pensamiento Interno</span>
            {showPensamiento ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Internal Pensamiento Box */}
      {showPensamiento && audit?.pensamiento && (
        <div className="mt-3 p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span>&lt;pensamiento&gt; (Cadena de razonamiento del modelo)</span>
            <span className="text-emerald-400 font-sans">gemini-2.5-flash</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{audit.pensamiento}</pre>
        </div>
      )}

      {/* Steps List */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {steps.map((st) => {
          const IconComponent = st.icon;
          const isActive = isProcessing;
          const isDone = Boolean(audit);

          return (
            <div
              key={st.num}
              className={`p-3 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  : isActive
                  ? 'bg-blue-50/60 border-blue-200 animate-pulse'
                  : 'bg-white border-slate-100 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                    {st.num}
                  </span>
                  <IconComponent className="w-4 h-4 text-slate-600" />
                </div>
                <div className="font-bold text-slate-800 text-xs">{st.name}</div>
                <div className="text-[11px] text-slate-500 font-medium">{st.subtitle}</div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-3">
                  {st.detail}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-700">
                {st.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
