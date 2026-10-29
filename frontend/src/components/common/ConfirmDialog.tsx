import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start space-x-3.5 mb-6">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="text-sm text-slate-600 leading-relaxed">{message}</div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2 ${
            isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
};
