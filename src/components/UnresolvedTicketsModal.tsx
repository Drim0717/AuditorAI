import React from 'react';
import { X, Image as ImageIcon, Clock, Calendar } from 'lucide-react';
import { UnresolvedTicket } from '../types/lottery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unresolvedTickets: UnresolvedTicket[];
}

export function UnresolvedTicketsModal({ isOpen, onClose, unresolvedTickets }: Props) {
  if (!isOpen) return null;

  // Helper to determine shift
  const getShift = (date: Date): 'AM' | 'PM' | 'OTRO' => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = hours + minutes / 60;

    // AM: 8:00 (8.0) to 15:59 (approx 15.99) - taking 3 PM as up to 3:59 PM
    if (time >= 8 && time < 16) {
      return 'AM';
    }
    // PM: 16:00 (16.0) to 22:30 (22.5)
    if (time >= 16 && time <= 22.5) {
      return 'PM';
    }
    return 'OTRO';
  };

  const getShiftLabel = (shift: 'AM' | 'PM' | 'OTRO') => {
    if (shift === 'AM') return 'Turno AM (8:00 AM - 3:59 PM)';
    if (shift === 'PM') return 'Turno PM (4:00 PM - 10:30 PM)';
    return 'Fuera de Horario';
  };

  // Group by Date string (YYYY-MM-DD), then by Shift
  const grouped = unresolvedTickets.reduce((acc, ticket) => {
    const dateStr = ticket.date.toLocaleDateString();
    const shift = getShift(ticket.date);

    if (!acc[dateStr]) acc[dateStr] = { AM: [], PM: [], OTRO: [] };
    acc[dateStr][shift].push(ticket);
    return acc;
  }, {} as Record<string, Record<'AM' | 'PM' | 'OTRO', UnresolvedTicket[]>>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tickets No Reconocidos</h2>
              <p className="text-xs text-slate-500">Fotos donde no se detectaron números, separadas por tanda.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-slate-100">
          {unresolvedTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
              <p>No hay tickets pendientes de revisión.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateStr) => {
                const dayGroup = grouped[dateStr];
                const shifts: Array<'AM' | 'PM' | 'OTRO'> = ['AM', 'PM', 'OTRO'];

                return (
                  <div key={dateStr} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm">{dateStr}</span>
                    </div>

                    <div className="p-4 space-y-6">
                      {shifts.map((shift) => {
                        const tickets = dayGroup[shift];
                        if (tickets.length === 0) return null;

                        return (
                          <div key={shift}>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                              <Clock className="w-3.5 h-3.5" />
                              {getShiftLabel(shift)} ({tickets.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {tickets.map((ticket) => (
                                <div key={ticket.id} className="group relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50 hover:border-blue-400 transition-colors">
                                  <img
                                    src={ticket.imageThumbnail}
                                    alt="Ticket sin reconocer"
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2">
                                    <p className="text-[10px] text-white font-medium">
                                      {ticket.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-[10px] text-rose-200 line-clamp-1">
                                      {ticket.reason}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
