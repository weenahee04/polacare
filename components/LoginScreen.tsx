import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, MessageSquare, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.mock';

interface LoginScreenProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister }) => {
  const { requestOTP, verifyOTP, isLoading, error, clearError } = useAuth();
  
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  // Timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Clear errors when switching steps
  useEffect(() => {
    setLocalError(null);
    clearError();
  }, [step, clearError]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (phoneNumber.length < 9) {
      setLocalError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    const result = await requestOTP(phoneNumber);
    
    if (result.success) {
      setStep('OTP');
      setTimer(60);
    } else {
      setLocalError(result.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (otp.length < 4) {
      setLocalError('กรุณากรอกรหัส OTP');
      return;
    }

    const result = await verifyOTP(phoneNumber, otp);
    
    if (result.success) {
      onLogin();
    } else {
      setLocalError(result.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setLocalError(null);
    const result = await requestOTP(phoneNumber);
    
    if (result.success) {
      setTimer(60);
    } else {
      setLocalError(result.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่');
    }
  };

  const handleBack = () => {
    setStep('PHONE');
    setOtp('');
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faff] px-6 py-12 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[40%] bg-green-100/30 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="flex flex-1 flex-col justify-center relative z-10">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center animate-fade-in-down">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0056b3] to-[#00a8e8] shadow-xl shadow-blue-500/20">
             <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 2v20M2 12h20" className="opacity-50" />
               <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" strokeWidth="3" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-kanit tracking-tight">
            POLA<span className="text-[#00a8e8]">CARE</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-kanit">เข้าสู่ระบบเพื่อใช้งาน (Sign in to continue)</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-kanit">{displayError}</p>
          </div>
        )}

        {step === 'PHONE' ? (
          /* STEP 1: PHONE INPUT */
          <form onSubmit={handleRequestOTP} className="space-y-6 animate-fade-in-up">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 font-kanit">เบอร์โทรศัพท์ (Mobile Number)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-2">
                   <Phone className="h-5 w-5 text-slate-400" />
                   <span className="text-sm font-medium text-slate-600 font-kanit">+66</span>
                </div>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Only numbers
                    if (val.length <= 10) setPhoneNumber(val);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-24 pr-4 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 font-kanit transition-all tracking-wide shadow-sm"
                  placeholder="xx-xxx-xxxx"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={phoneNumber.length < 9 || isLoading}
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0056b3] to-[#00a8e8] py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed font-kanit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  ขอรหัส OTP (Request OTP)
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP INPUT */
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-2">
                <button 
                  type="button" 
                  onClick={handleBack} 
                  disabled={isLoading}
                  className="text-xs text-slate-400 font-kanit mb-2 flex items-center justify-center gap-1 mx-auto hover:text-slate-600 disabled:opacity-50"
                >
                    <ChevronLeft className="h-3 w-3" /> แก้ไขเบอร์โทรศัพท์
                </button>
                <p className="text-sm font-bold text-slate-800 font-kanit">
                    ส่งรหัสไปยัง {phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 font-kanit">รหัสยืนยัน (Verification Code)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setOtp(val);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-center text-xl font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 font-kanit transition-all tracking-[0.5em] shadow-sm"
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs font-kanit">
                <span className="text-slate-500">กรุณากรอกรหัส 6 หลัก</span>
                {timer > 0 ? (
                    <span className="text-slate-400">ส่งใหม่ใน {timer} วินาที</span>
                ) : (
                    <button 
                      type="button" 
                      onClick={handleResendOTP} 
                      disabled={isLoading}
                      className="text-[#0056b3] font-bold hover:underline disabled:opacity-50"
                    >
                        ส่งรหัสอีกครั้ง (Resend)
                    </button>
                )}
            </div>

            <button 
              type="submit"
              disabled={otp.length < 4 || isLoading}
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0056b3] to-[#00a8e8] py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed font-kanit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                'เข้าสู่ระบบ (Verify & Login)'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-kanit">
            ยังไม่มีบัญชี? (Don't have an account?){' '}
            <button 
              onClick={onSwitchToRegister} 
              disabled={isLoading}
              className="font-bold text-[#0056b3] hover:underline disabled:opacity-50"
            >
              สมัครสมาชิก (Sign Up)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
