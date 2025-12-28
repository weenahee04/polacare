import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, Phone, User, ArrowLeft, Camera, Calendar, Weight, Ruler, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.mock';

interface RegisterScreenProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      gender: 'Male',
      dateOfBirth: '',
      weight: '',
      height: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatarPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) return 'กรุณากรอกนามสกุล';
    if (formData.phoneNumber.length < 9) return 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
    if (formData.password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (!formData.dateOfBirth) return 'กรุณาเลือกวันเกิด';
    if (!formData.weight || parseFloat(formData.weight) <= 0) return 'กรุณากรอกน้ำหนัก';
    if (!formData.height || parseFloat(formData.height) <= 0) return 'กรุณากรอกส่วนสูง';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    
    // Validate
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    // Prepare data
    const registerData = {
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      avatarUrl: avatarPreview || undefined,
    };

    const result = await register(registerData);
    
    if (result.success) {
      onRegister();
    } else {
      setLocalError(result.message || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่');
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faff] px-6 py-8 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] bg-purple-100/30 rounded-full blur-[60px] pointer-events-none"></div>

      <button 
        onClick={onSwitchToLogin}
        disabled={isLoading}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/80 backdrop-blur-sm text-slate-600 transition-colors hover:bg-white z-20 relative shadow-sm disabled:opacity-50"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-1 flex-col relative z-10">
        <div className="mb-6 animate-fade-in-down">
          <h1 className="text-2xl font-bold text-slate-800 font-kanit">สร้างโปรไฟล์สุขภาพ</h1>
          <p className="mt-1 text-sm text-slate-500 font-kanit">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน Polacare</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-kanit">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up pb-8">
          
          {/* Profile Image Uploader */}
          <div className="flex flex-col items-center justify-center mb-6">
             <div className="relative">
                 <div 
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    className="relative h-28 w-28 rounded-full bg-white border-4 border-white shadow-xl cursor-pointer hover:scale-105 transition-transform overflow-hidden group"
                 >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-12 w-12 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                 </div>
                 
                 {/* Camera Badge */}
                 <button 
                    type="button"
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="absolute bottom-1 right-1 h-9 w-9 bg-[#0056b3] rounded-full border-2 border-white flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                 >
                    <Camera className="h-5 w-5 text-white" />
                 </button>
             </div>
             <p className="mt-3 text-xs text-slate-500 font-bold font-kanit">อัปโหลดรูปโปรไฟล์ (Upload Photo)</p>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
             />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">ชื่อ (First Name)</label>
                <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit shadow-sm disabled:opacity-50"
                    disabled={isLoading}
                    required
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">นามสกุล (Last Name)</label>
                <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit shadow-sm disabled:opacity-50"
                    disabled={isLoading}
                    required
                />
             </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 font-kanit">เบอร์โทรศัพท์ (Mobile)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-2">
                   <Phone className="h-5 w-5 text-slate-400" />
                   <span className="text-sm font-medium text-slate-600 font-kanit">+66</span>
              </div>
              <input 
                type="tel" 
                value={formData.phoneNumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({...formData, phoneNumber: val});
                }}
                className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 pl-24 pr-4 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit tracking-wide shadow-sm disabled:opacity-50"
                placeholder="xx-xxx-xxxx"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Gender & DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">เพศ (Gender)</label>
                <select 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 px-4 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit appearance-none shadow-sm disabled:opacity-50"
                    disabled={isLoading}
                >
                    <option value="Male">ชาย (Male)</option>
                    <option value="Female">หญิง (Female)</option>
                    <option value="Other">อื่นๆ (Other)</option>
                </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">วันเกิด (Date of Birth)</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit shadow-sm disabled:opacity-50"
                        disabled={isLoading}
                        required
                    />
                </div>
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">น้ำหนัก (kg)</label>
                <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="number" 
                        value={formData.weight}
                        onChange={e => setFormData({...formData, weight: e.target.value})}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit shadow-sm disabled:opacity-50"
                        disabled={isLoading}
                        required
                    />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-kanit">ส่วนสูง (cm)</label>
                <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="number" 
                        value={formData.height}
                        onChange={e => setFormData({...formData, height: e.target.value})}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit shadow-sm disabled:opacity-50"
                        disabled={isLoading}
                        required
                    />
                </div>
             </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 font-kanit">รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3 pl-10 pr-10 text-sm text-slate-800 outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] font-kanit transition-all shadow-sm disabled:opacity-50"
                placeholder="กำหนดรหัสผ่าน (8 ตัวขึ้นไป)"
                disabled={isLoading}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-kanit">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#0056b3] to-[#00a8e8] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 font-kanit flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังลงทะเบียน...
              </>
            ) : (
              'ลงทะเบียน (Register)'
            )}
          </button>
        </form>

        <div className="text-center pb-6">
          <p className="text-sm text-slate-500 font-kanit">
            มีบัญชีอยู่แล้ว?{' '}
            <button 
              onClick={onSwitchToLogin} 
              disabled={isLoading}
              className="font-bold text-[#0056b3] hover:underline disabled:opacity-50"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
