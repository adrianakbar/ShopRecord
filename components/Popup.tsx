'use client';

import { useEffect } from 'react';

export type PopupType = 'success' | 'error' | 'info' | 'warning';

interface PopupProps {
  message: string;
  type: PopupType;
  onClose: () => void;
  duration?: number;
}

export default function Popup({ message, type, onClose, duration = 3000 }: PopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[300] min-w-[320px] max-w-md rounded-xl border p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-5 fade-in duration-300 ${getColors()}`}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[24px] flex-shrink-0 mt-0.5">
          {getIcon()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-relaxed break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
}
