
import React from 'react';
import { ArrowRight } from 'lucide-react';

export const SectionBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0056b3] to-[#00a8e8] shadow-lg">
      <div className="relative z-10 flex flex-col items-start justify-center p-6">
        <span className="mb-2 rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
          RECOMMENDED
        </span>
        <h3 className="text-lg font-bold text-white font-kanit tracking-wide drop-shadow-sm">
          Polacare Premium
        </h3>
        <p className="mb-4 text-xs text-blue-50 font-kanit max-w-[80%] leading-relaxed opacity-90 drop-shadow-sm">
          อัปเกรดระดับสมาชิก รับสิทธิพิเศษเหนือใคร (Upgrade for exclusive benefits)
        </p>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-blue-100 transition-colors font-kanit bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm shadow-sm">
          ดูรายละเอียด <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      
      {/* Decorative gradient orb to replace image for visual interest */}
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
    </div>
  );
};
