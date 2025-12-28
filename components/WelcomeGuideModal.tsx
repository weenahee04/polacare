
import React from 'react';
import { Eye, Gift, Activity, ShieldCheck, ArrowRight, Video } from 'lucide-react';

interface WelcomeGuideModalProps {
  onAccept: () => void;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Header Image/Gradient */}
        <div className="bg-gradient-to-br from-[#0056b3] to-[#00a8e8] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 h-24 w-24 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
             <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/20">
                <ShieldCheck className="h-9 w-9 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-white font-kanit">ยินดีต้อนรับสู่ Polacare</h2>
             <p className="text-blue-50 text-sm font-kanit mt-1 opacity-90">แอปพลิเคชันดูแลสุขภาพดวงตา</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           <div className="space-y-5">
              <FeatureItem 
                icon={Video} 
                color="bg-purple-100 text-purple-600"
                title="Telemedicine"
                desc="ปรึกษาจักษุแพทย์ผ่านวิดีโอคอลได้ทุกที่ ทุกเวลา สะดวก รวดเร็ว"
              />
              <FeatureItem 
                icon={Eye} 
                color="bg-blue-100 text-blue-600"
                title="Eye Care Center"
                desc="ศูนย์ดูแลดวงตา ทดสอบตาบอดสี (Ishihara), จอประสาทตาเสื่อม (Amsler) ด้วยตนเอง"
              />
              <FeatureItem 
                icon={Activity} 
                color="bg-green-100 text-green-600"
                title="Medical Records"
                desc="เข้าถึงประวัติการรักษา และผลการตรวจย้อนหลังได้อย่างง่ายดาย"
              />
              <FeatureItem 
                icon={Gift} 
                color="bg-orange-100 text-orange-600"
                title="Smart Rewards"
                desc="สะสมแต้มจากการดูแลสุขภาพ เพื่อแลกรับของรางวัลและบริการทางการแพทย์สุดพิเศษ"
              />
           </div>

           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 font-kanit leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1">ข้อตกลงและเงื่อนไข:</span>
              แอปพลิเคชันนี้เป็นเครื่องมือช่วยบันทึกและคัดกรองเบื้องต้นเท่านั้น หากมีอาการรุนแรงควรพบแพทย์ทันที
           </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-100 bg-white">
           <button 
             onClick={onAccept}
             className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0056b3] text-white font-bold font-kanit shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
           >
             รับทราบและเริ่มต้นใช้งาน <ArrowRight className="h-4 w-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, color, title, desc }: any) => (
  <div className="flex gap-4">
     <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
     </div>
     <div>
        <h3 className="font-bold text-slate-800 font-kanit text-sm">{title}</h3>
        <p className="text-xs text-slate-500 font-kanit leading-relaxed mt-1">{desc}</p>
     </div>
  </div>
);
