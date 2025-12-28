
import React from 'react';
import { Activity, Users, FileText } from 'lucide-react';

interface HeroCardProps {
  totalCases: number;
  todayCases: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({ totalCases, todayCases }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#0056b3] to-[#00a8e8] p-5 sm:p-6 shadow-xl shadow-blue-500/20">
      {/* Abstract Background Patterns */}
      <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      
      <svg className="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
         <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* Header Line */}
        <div className="flex items-center justify-between text-blue-50">
          <span className="text-xs sm:text-sm font-kanit font-light tracking-wide opacity-90">OPD Summary</span>
          <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-sm">
             <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
             <span className="text-[10px] font-bold">Live</span>
          </div>
        </div>

        {/* Stats Display */}
        <div className="flex gap-8">
            <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm font-kanit">
                    {todayCases} <span className="text-xl sm:text-2xl font-normal opacity-80">Cases</span>
                </h1>
                <p className="mt-1 text-[10px] sm:text-xs text-blue-100 opacity-70 font-inter">Today's Queue</p>
            </div>
            <div className="hidden sm:block w-px bg-white/20 h-12 self-center"></div>
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold text-white/90 tracking-tight font-kanit">
                    {totalCases}
                </h1>
                <p className="mt-1 text-[10px] text-blue-100 opacity-70 font-inter">Total Records</p>
            </div>
        </div>

        {/* Banner Text / Notification */}
        <div className="mt-1 flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/20">
          <div className="flex-shrink-0 rounded-full bg-white/20 p-1.5 sm:p-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1">
             <h3 className="font-semibold text-white text-xs sm:text-sm font-kanit leading-tight">Patient Management System</h3>
             <p className="text-[10px] sm:text-xs text-blue-50 opacity-90 font-kanit leading-tight mt-0.5">Slit Lamp AI Analysis & Reporting</p>
          </div>
        </div>
      </div>
    </div>
  );
};
