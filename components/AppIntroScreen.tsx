
import React from 'react';
import { ShieldCheck, Video, Gift, Activity, ArrowRight, ArrowLeft } from 'lucide-react';

interface AppIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const AppIntroScreen: React.FC<AppIntroScreenProps> = ({ onNext, onBack }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8faff] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl pointer-events-none"></div>

      {/* Nav */}
      <div className="p-6 relative z-10">
        <button 
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-10 relative z-10">
        
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
           <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0056b3] to-[#00a8e8] shadow-lg mb-4">
              <Activity className="h-8 w-8 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 font-kanit">ยินดีต้อนรับสู่ Polacare</h1>
           <p className="text-slate-500 font-kanit mt-2 leading-relaxed">
             แพลตฟอร์มดูแลสุขภาพดวงตาครบวงจร พร้อมผู้ช่วย AI อัจฉริยะ (Your All-in-One Eye Care Platform)
           </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 flex-1 animate-fade-in-up">
           <FeatureRow 
             icon={Video} 
             color="bg-purple-100 text-purple-600" 
             title="Telemedicine" 
             desc="ปรึกษาจักษุแพทย์ออนไลน์ผ่านวิดีโอคอล ได้ทุกที่ ทุกเวลา" 
           />
           <FeatureRow 
             icon={ShieldCheck} 
             color="bg-green-100 text-green-600" 
             title="AI Health Assistant" 
             desc="วิเคราะห์สุขภาพตาเบื้องต้นด้วย AI และจัดเก็บประวัติการรักษาแบบดิจิทัล" 
           />
           <FeatureRow 
             icon={Gift} 
             color="bg-orange-100 text-orange-600" 
             title="Smart Rewards" 
             desc="สะสมแต้มจากการดูแลสุขภาพ แลกรับสิทธิพิเศษมากมาย" 
           />
        </div>

        {/* Action */}
        <div className="mt-8">
           <button 
             onClick={onNext}
             className="w-full py-4 bg-gradient-to-r from-[#0056b3] to-[#00a8e8] text-white rounded-2xl font-bold font-kanit shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             ถัดไป (Next) <ArrowRight className="h-5 w-5" />
           </button>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon: Icon, color, title, desc }: any) => (
  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
     <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
     </div>
     <div>
        <h3 className="font-bold text-slate-800 font-kanit">{title}</h3>
        <p className="text-xs text-slate-500 font-kanit mt-1 leading-relaxed">{desc}</p>
     </div>
  </div>
);
