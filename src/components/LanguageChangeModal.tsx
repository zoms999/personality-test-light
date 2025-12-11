'use client';

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface LanguageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function LanguageChangeModal({ isOpen, onClose, message }: LanguageChangeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <AlertTriangle size={48} className="text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2 break-keep">
            언어 변경 제한
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 break-keep">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
