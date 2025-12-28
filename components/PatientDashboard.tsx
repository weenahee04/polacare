
import React from 'react';
import { BannerCarousel } from './BannerCarousel';
import { Calendar, MapPin, ChevronRight, Clock, ShieldCheck, User, QrCode, FileText, ScanEye, Stethoscope, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface PatientDashboardProps {
  userProfile: UserProfile;
  onNavigateToCare: () => void;
  onNavigateToRecords: () => void;
  onShowNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
    userProfile, 
    onNavigateToCare, 
    onNavigateToRecords,
    onShowNotification 
}) => {
  // Calculate Age
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const age = calculateAge(userProfile.dateOfBirth);

  const handleUnderDevelopment = (feature: string) => {
    onShowNotification(
        'อยู่ระหว่างปรับปรุง',
        `ขออภัย ฟีเจอร์ "${feature}" กำลังอยู่ระหว่างการพัฒนา\n(Sorry, "${feature}" is currently under development.)`,
        'warning'
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Digital Health ID Card */}
      <div className="pt-4 px-5">
         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0056b3] to-[#0088d4] text-white shadow-xl shadow-blue-500/20">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
            
            <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="h-16 w-16 rounded-full border-4 border-white/30 bg-white/20 overflow-hidden flex items-center justify-center shadow-inner">
                            {userProfile.avatarUrl ? (
                                <img src={userProfile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-8 w-8 text-white/80" />
                            )}
                        </div>
                        {/* Name & HN */}
                        <div>
                            <h2 className="text-xl font-bold font-kanit tracking-tight leading-none text-white">
                                {userProfile.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-kanit border border-white/10 backdrop-blur-sm">
                                    {userProfile.hn}
                                </span>
                                <span className="text-blue-100 text-xs font-kanit border-l border-white/30 pl-2">
                                    {age} Years • {userProfile.gender}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* QR Code */}
                    <button 
                        onClick={() => onShowNotification('QR Code', 'ใช้สำหรับสแกนที่จุดบริการโรงพยาบาล', 'info')}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10 shadow-sm"
                    >
                        <QrCode className="h-6 w-6 text-white" />
                    </button>
                </div>

                {/* Treatment Eligibility Badge - Updated to Verified */}
                <div className="mb-5 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 to-green-300 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        ยืนยันตัวตนแล้ว (Verified)
                    </div>
                </div>

                {/* Health Stats Row */}
                <div className="grid grid-cols-3 gap-2 bg-black/10 rounded-2xl p-3 backdrop-blur-sm border border-white/5">
                    <div className="text-center border-r border-white/10">
                        <p className="text-[10px] text-blue-200 font-kanit uppercase">Weight</p>
                        <p className="text-lg font-bold font-kanit">{userProfile.weight} <span className="text-xs font-normal opacity-70">kg</span></p>
                    </div>
                    <div className="text-center border-r border-white/10">
                        <p className="text-[10px] text-blue-200 font-kanit uppercase">Height</p>
                        <p className="text-lg font-bold font-kanit">{userProfile.height} <span className="text-xs font-normal opacity-70">cm</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-blue-200 font-kanit uppercase">BMI</p>
                        <p className="text-lg font-bold font-kanit">{userProfile.bmi}</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Medical Notification Banner */}
      <div className="px-5">
         <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-3 shadow-sm animate-pulse">
            <div className="bg-orange-100 p-2 rounded-full text-orange-500 mt-0.5">
                <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 font-kanit">แจ้งเตือนสุขภาพ (Health Alert)</h4>
                <p className="text-xs text-slate-600 font-kanit mt-0.5">
                    ถึงเวลาหยอดตา Hialid (Tears) แล้วค่ะ
                </p>
            </div>
            <button 
                onClick={() => onShowNotification('รับทราบ', 'บันทึกการใช้ยาเรียบร้อยแล้ว', 'success')}
                className="text-xs font-bold text-orange-600 bg-white border border-orange-200 px-3 py-1.5 rounded-lg shadow-sm"
            >
                ตกลง
            </button>
         </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-5">
         <h3 className="font-bold text-slate-700 font-kanit mb-3 px-1">เมนูด่วน (Quick Actions)</h3>
         <div className="grid grid-cols-4 gap-3">
             {/* Exam Results */}
             <button onClick={onNavigateToRecords} className="flex flex-col items-center gap-2 group">
                 <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform group-hover:border-blue-200">
                     <FileText className="h-6 w-6" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-600 text-center font-kanit leading-tight">ผลการตรวจ<br/>(Results)</span>
             </button>

             {/* Slit Lamp Images */}
             <button onClick={onNavigateToRecords} className="flex flex-col items-center gap-2 group">
                 <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform group-hover:border-purple-200">
                     <ScanEye className="h-6 w-6" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-600 text-center font-kanit leading-tight">ภาพถ่ายตา<br/>(Images)</span>
             </button>

             {/* Appointments */}
             <button onClick={() => handleUnderDevelopment('นัดหมาย (Appointments)')} className="flex flex-col items-center gap-2 group">
                 <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform group-hover:border-orange-200">
                     <Calendar className="h-6 w-6" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-600 text-center font-kanit leading-tight">นัดหมาย<br/>(Appts)</span>
             </button>

             {/* Doctor Advice */}
             <button onClick={() => handleUnderDevelopment('ปรึกษาแพทย์ (Doctor Consultation)')} className="flex flex-col items-center gap-2 group">
                 <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform group-hover:border-green-200">
                     <Stethoscope className="h-6 w-6" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-600 text-center font-kanit leading-tight">ปรึกษาแพทย์<br/>(Doctor)</span>
             </button>
         </div>
      </div>

      {/* Wellness Banners */}
      <div className="pt-2">
        <BannerCarousel />
      </div>

      {/* Next Appointment Card */}
      <div className="px-5">
         <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-700 font-kanit">การนัดหมายถัดไป</h3>
            <button onClick={() => handleUnderDevelopment('นัดหมาย (Appointments)')} className="text-xs text-[#0056b3] font-kanit font-medium">ดูทั้งหมด</button>
         </div>
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-24 w-24 bg-blue-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            
            <div className="relative z-10">
               <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center bg-blue-50 rounded-xl p-2 min-w-[60px]">
                     <span className="text-xs font-bold text-blue-600 font-kanit uppercase">Oct</span>
                     <span className="text-2xl font-bold text-slate-800 font-kanit">28</span>
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-slate-800 font-kanit text-lg">Follow-up Exam</h4>
                     <p className="text-sm text-slate-500 font-kanit">Dr. Somchai (Ophthalmologist)</p>
                     
                     <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-kanit bg-slate-50 px-2 py-1 rounded-lg">
                           <Clock className="h-3.5 w-3.5 text-orange-400" />
                           10:00 AM
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-kanit bg-slate-50 px-2 py-1 rounded-lg">
                           <MapPin className="h-3.5 w-3.5 text-red-400" />
                           Clinic 2, FL 3
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Article Teaser */}
      <div className="px-5">
         <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between cursor-pointer" onClick={onNavigateToCare}>
            <div>
               <h4 className="font-bold font-kanit text-lg">รู้จักกับ CVS Syndrome</h4>
               <p className="text-xs text-slate-300 font-kanit mt-1 opacity-80">อาการตาล้าที่คนทำงานต้องระวัง</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
               <ChevronRight className="h-5 w-5" />
            </div>
         </div>
      </div>
    </div>
  );
};
