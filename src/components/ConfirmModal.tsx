'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !internalLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, internalLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isLoading || internalLoading;

  // Colors based on variant
  const iconColors = {
    danger: 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-rose-500/10',
    warning: 'bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-500/10',
    primary: 'bg-indigo-50 text-indigo-600 border-indigo-200/80 shadow-indigo-500/10',
  }[variant];

  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
    warning: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:opacity-95 text-white shadow-amber-500/25',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25',
  }[variant];

  const Icon = variant === 'danger' ? Trash2 : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-200/80 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg mb-4 ${iconColors}`}>
            <Icon className="w-6 h-6 animate-in zoom-in-75 duration-300" />
          </div>

          {/* Title & Message */}
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed max-w-[340px]">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${buttonColors}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
