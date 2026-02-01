import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-slate-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};