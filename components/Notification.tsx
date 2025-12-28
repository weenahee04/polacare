
import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
  isOpen, onClose, type, title, message, actionLabel, onAction 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-10 w-10 text-green-500" />;
      case 'error': return <AlertCircle className="h-10 w-10 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-10 w-10 text-orange-500" />;
      case 'info': default: return <Info className="h-10 w-10 text-[#0056b3]" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      case 'warning': return 'bg-orange-50';
      case 'info': default: return 'bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-5 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
        <div className="p-6 flex flex-col items-center text-center">
            <div className={`mb-4 p-4 rounded-full ${getBgColor()}`}>
                {getIcon()}
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-kanit mb-2">{title}</h3>
            <p className="text-sm text-slate-500 font-kanit mb-6 leading-relaxed px-2">
                {message}
            </p>
            
            <div className="flex gap-3 w-full">
                {actionLabel && onAction && (
                    <button 
                        onClick={() => { onAction(); onClose(); }}
                        className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold font-kanit hover:bg-slate-200 transition-colors"
                    >
                        {actionLabel}
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className={`flex-1 py-3 rounded-xl font-bold font-kanit transition-all active:scale-95 ${
                        actionLabel 
                        ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-[#0056b3] text-white shadow-lg shadow-blue-500/30 w-full'
                    }`}
                >
                    ตกลง (OK)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
