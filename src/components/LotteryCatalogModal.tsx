import React, { useState } from 'react';
import {
  Database,
  X,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Globe,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { MasterLottery } from '../types/lottery';
import {
  getMasterLotteries,
  saveCustomLottery,
  deleteCustomLottery,
} from '../utils/lotteryMasterCatalog';

interface LotteryCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogUpdated?: () => void;
}

export const LotteryCatalogModal: React.FC<LotteryCatalogModalProps> = ({
  isOpen,
  onClose,
  onCatalogUpdated,
}) => {
  const [catalog, setCatalog] = useState<MasterLottery[]>(getMasterLotteries());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New lottery form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState<'USA' | 'Rep. Dominicana' | 'Internacional'>('USA');
  const [newSchedule, setNewSchedule] = useState<'AM / Mañana' | 'PM / Tarde' | 'Noche'>('AM / Mañana');
  const [newAliases, setNewAliases] = useState('');

  if (!isOpen) return null;

  const refreshCatalog = () => {
    const list = getMasterLotteries();
    setCatalog(list);
    onCatalogUpdated?.();
  };

  const handleCreateLottery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const aliasesArr = newAliases
      .split(',')
      .map((a) => a.trim().toUpperCase())
      .filter(Boolean);

    saveCustomLottery({
      code: newCode.trim().toUpperCase(),
      fullName: newName.trim() || newCode.trim().toUpperCase(),
      region: newRegion,
      schedule: newSchedule,
      aliases: aliasesArr,
      isCustom: true,
    });

    setNewCode('');
    setNewName('');
    setNewAliases('');
    setIsAddingNew(false);
    refreshCatalog();
  };

  const handleDelete = (code: string) => {
    deleteCustomLottery(code);
    refreshCatalog();
  };

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aliases.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion = filterRegion === 'all' || item.region === filterRegion;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Base de Datos Maestra de Loterías Válidas
              </h3>
              <p className="text-xs text-slate-500">
                Lista oficial para validar las casillas detectadas por el OCR ({catalog.length} códigos)
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

        {/* Search & Actions Bar */}
        <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o alias (ej: NY AM, Florida, Gana Más)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Todas las regiones</option>
              <option value="USA">USA</option>
              <option value="Rep. Dominicana">Rep. Dominicana</option>
            </select>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Código
            </button>
          </div>
        </div>

        {/* Add New Custom Lottery Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateLottery}
            className="mt-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-2.5 animate-slide-down"
          >
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Registrar Nuevo Código de Lotería
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Código Canónico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. TX AM"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Texas Pick 3 Morning"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Región
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="USA">USA</option>
                  <option value="Rep. Dominicana">Rep. Dominicana</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Horario
                </label>
                <select
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="AM / Mañana">AM / Mañana</option>
                  <option value="PM / Tarde">PM / Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Alias comunes o variaciones escritas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="TXA, TEXAS AM, TX DAY"
                value={newAliases}
                onChange={(e) => setNewAliases(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
              >
                Guardar en Lista Maestra
              </button>
            </div>
          </form>
        )}

        {/* Master List Grid */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No se encontraron loterías con ese criterio de búsqueda.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.code}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 text-center py-1 rounded-lg bg-blue-600 text-white font-mono font-black text-xs shadow-xs">
                    {item.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{item.fullName}</span>
                      {item.isCustom && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                          Personalizada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Globe className="w-3 h-3 text-slate-400" /> {item.region}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-400" /> {item.schedule}
                      </span>
                      {item.aliases.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <Tag className="w-3 h-3" /> {item.aliases.slice(0, 3).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isCustom ? (
                    <button
                      onClick={() => handleDelete(item.code)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Eliminar personalizada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Oficial
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Los códigos de esta lista se usan para validar el Paso 2 de la auditoría.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
