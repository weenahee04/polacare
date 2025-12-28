
import React from 'react';
import { ArrowLeft, Calendar, Share2, ScanEye, Stethoscope, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PatientCase } from '../types';
import { SlitLampChecklist } from './SlitLampChecklist';

interface CaseDetailViewProps {
  data: PatientCase;
  onBack: () => void;
  onShowNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({ data, onBack, onShowNotification }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative z-50">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-40 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button 
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
             >
                <ArrowLeft className="h-6 w-6" />
             </button>
             <div>
                <h2 className="text-lg font-bold text-slate-800 font-kanit leading-none">ผลตรวจ Slit Lamp</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-slate-500 font-inter bg-slate-100 px-1.5 py-0.5 rounded">HN: {data.hn}</span>
                    <span className="text-[10px] text-slate-400 font-kanit flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {data.date.toLocaleDateString()}
                    </span>
                </div>
             </div>
         </div>
         
         <div className="flex gap-2">
            <button 
                onClick={() => onShowNotification('Share', 'แชร์ผลการตรวจไปยัง Line สำเร็จ', 'success')}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0056b3] transition-colors"
            >
                <Share2 className="h-5 w-5" />
            </button>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
         
         {/* 1. Main Visual Evidence (Slit Lamp Photo) */}
         <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative aspect-[4/3] group">
            <img 
                src={data.imageUrl} 
                alt="Slit Lamp Exam" 
                className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold font-kanit flex items-center gap-2 border border-white/10">
                <ScanEye className="h-4 w-4 text-blue-400" />
                Slit Lamp Image
            </div>
         </div>

         {/* 2. Diagnosis Summary */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-l-[#0056b3] border-y border-r border-slate-200">
             <div className="flex items-start justify-between">
                 <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-kanit mb-1">
                        Diagnosis (คำวินิจฉัย)
                    </h3>
                    <p className="text-xl font-bold text-slate-800 font-kanit">
                        {data.diagnosis}
                    </p>
                 </div>
                 <div className={`p-2 rounded-full ${data.diagnosis.includes('Normal') ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {data.diagnosis.includes('Normal') ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                 </div>
             </div>
             
             {/* Doctor Notes */}
             <div className="mt-4 pt-4 border-t border-slate-100">
                 <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm font-kanit">
                    <Stethoscope className="h-4 w-4 text-[#0056b3]" />
                    Doctor's Note
                 </div>
                 <p className="text-sm text-slate-600 font-kanit leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {data.aiAnalysisText || "No additional notes recorded."}
                 </p>
             </div>
         </div>

         {/* 3. Detailed Structural Findings (Checklist) */}
         <div className="flex flex-col gap-3">
             <h3 className="text-sm font-bold text-slate-700 font-kanit flex items-center gap-2 px-1">
                 <Eye className="h-4 w-4 text-[#0056b3]" />
                 Structural Findings (รายละเอียดโครงสร้างตา)
             </h3>
             <div className="h-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <SlitLampChecklist 
                    data={data.checklist} 
                    isLoading={false} 
                    readOnly={true} 
                 />
             </div>
         </div>

      </div>
    </div>
  );
};
