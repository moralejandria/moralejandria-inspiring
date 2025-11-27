
import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  isOpen,
  onClose,
  onDeleteHistory,
  onDeleteItem,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#F9F7F1] shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-blue-100 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-[#F0EBE0]">
          <h2 className="text-lg font-bold text-blue-900 font-serif">Tus Consultas</h2>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-blue-300 mt-10 text-sm italic serif-font">
              Aún no hay historias guardadas.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-blue-50 hover:border-blue-200 shadow-sm hover:shadow-md transition-all group relative">
                <p className="text-xs text-blue-300 mb-1 font-serif italic">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-blue-900 line-clamp-2 mb-2 font-serif">"{item.query}"</p>
                <p className="text-xs text-slate-600 line-clamp-2 font-light">
                  {item.response}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                  className="absolute top-2 right-2 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Borrar"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-blue-100 bg-[#F9F7F1]">
            <button
              onClick={onDeleteHistory}
              className="w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-100 font-medium"
            >
              Borrar todo el historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
