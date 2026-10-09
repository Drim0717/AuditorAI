import React from 'react';
import { AuditResult } from '../types/lottery';
import { History, X, Trash2, Download, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AuditResult[];
  onSelectAudit: (audit: AuditResult) => void;
  onClearHistory: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudit,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const totalBookSales = history.reduce((acc, h) => acc + h.totalPageSale, 0);
  const totalBookPrizes = history.reduce((acc, h) => acc + (h.totalPagePrize || 0), 0);

  const handleExportText = () => {
    let fullReport = `=== REPORTE DE AUDITORÍA DE TICKETS ===\n`;
    fullReport += `Total Páginas: ${history.length}\n`;
    fullReport += `Venta Total Acumulada: $${totalBookSales}\n`;
    fullReport += `Premio Total: $${totalBookPrizes}\n`;
    fullReport += `Balance Neto: $${totalBookSales - totalBookPrizes}\n\n`;

    history.forEach((h, idx) => {
      fullReport += `--- Registro #${idx + 1} (${h.timestamp}) ---\n`;
      fullReport += `${h.formattedOutput}\n\n`;
    });

    const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria_tickets_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Historial de Páginas Auditadas
              </h3>
              <p className="text-xs text-slate-500">
                Libro de ventas acumulado en esta sesión ({history.length} páginas)
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

        {/* Stats banner */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Páginas</span>
            <span className="font-mono font-bold text-slate-800 text-lg">{history.length}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Venta Total</span>
            <span className="font-mono font-black text-blue-800 text-lg">${totalBookSales}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Balance Neto</span>
            <span className="font-mono font-black text-emerald-800 text-lg">
              ${totalBookSales - totalBookPrizes}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay hojas registradas en el historial todavía.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  onSelectAudit(item);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {item.imageThumbnail ? (
                    <img
                      src={item.imageThumbnail}
                      alt="Miniatura"
                      className="w-12 h-14 object-cover rounded border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-14 bg-slate-100 rounded border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-500">
                      P.{item.pageNumber}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        Página {item.pageNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.timestamp}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {item.quadrants
                        .filter((q) => !q.isEmpty)
                        .map((q) => `${q.name}: $${q.confirmedTotal}`)
                        .join(' | ')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-slate-900 text-base">
                    ${item.totalPageSale}
                  </div>
                  {item.totalPagePrize > 0 && (
                    <div className="text-[10px] text-amber-700 font-semibold">
                      Premio: ${item.totalPagePrize}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Vaciar Historial
          </button>

          <button
            onClick={handleExportText}
            disabled={history.length === 0}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Exportar Reporte (.txt)
          </button>
        </div>
      </div>
    </div>
  );
};
