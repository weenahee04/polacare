
import React, { useState } from 'react';
import { ArrowLeft, Check, FileText, Shield } from 'lucide-react';

interface TermsScreenProps {
  onAccept: () => void;
  onBack: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onAccept, onBack }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faff] relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 font-kanit">เงื่อนไขการใช้งาน</h1>
      </div>

      <div className="flex-1 px-6 py-6 pb-32">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-[#0056b3]">
                    <FileText className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-slate-800 font-kanit">Terms of Service</h2>
            </div>
            <div className="h-64 overflow-y-auto pr-2 text-xs text-slate-500 font-kanit leading-relaxed space-y-3 custom-scrollbar">
                <p>
                    <strong>1. ข้อตกลงทั่วไป</strong><br/>
                    ยินดีต้อนรับสู่ Polacare การใช้งานแอปพลิเคชันนี้ถือว่าท่านยอมรับข้อตกลงและเงื่อนไขทั้งหมดที่ระบุไว้ หากท่านไม่ยอมรับ กรุณาระงับการใช้งานทันที
                </p>
                <p>
                    <strong>2. การให้บริการทางการแพทย์</strong><br/>
                    ข้อมูลและบริการ AI บนแอปพลิเคชันเป็นเพียงเครื่องมือคัดกรองเบื้องต้น ไม่สามารถทดแทนการวินิจฉัยโดยแพทย์ผู้เชี่ยวชาญได้ หากมีอาการฉุกเฉิน กรุณาไปโรงพยาบาลทันที
                </p>
                <p>
                    <strong>3. บัญชีผู้ใช้</strong><br/>
                    ท่านต้องเก็บรักษาชื่อผู้ใช้และรหัสผ่านเป็นความลับ และรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน
                </p>
                <p>
                    <strong>4. ทรัพย์สินทางปัญญา</strong><br/>
                    เนื้อหา รูปภาพ และโลโก้ทั้งหมดในแอปพลิเคชันเป็นลิขสิทธิ์ของ Polacare ห้ามคัดลอกหรือดัดแปลงโดยไม่ได้รับอนุญาต
                </p>
                <p>--------------------------------------------------</p>
                 <div className="flex items-center gap-3 mb-2 mt-4">
                    <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <Shield className="h-4 w-4" />
                    </div>
                    <h2 className="font-bold text-slate-800 font-kanit">Privacy Policy (PDPA)</h2>
                </div>
                <p>
                    <strong>1. การเก็บรวบรวมข้อมูล</strong><br/>
                    เราเก็บรวบรวมข้อมูลส่วนบุคคล เช่น ชื่อ เบอร์โทรศัพท์ ประวัติสุขภาพ เพื่อประโยชน์ในการรักษาและการให้บริการตามมาตรฐานสาธารณสุข
                </p>
                <p>
                    <strong>2. การใช้ข้อมูล</strong><br/>
                    ข้อมูลของท่านจะถูกใช้เพื่อการวิเคราะห์ทาง AI การนัดหมายแพทย์ และการปรับปรุงบริการ โดยจะถูกเก็บรักษาอย่างปลอดภัยตามมาตรฐาน PDPA
                </p>
                <p>
                    <strong>3. สิทธิของเจ้าของข้อมูล</strong><br/>
                    ท่านมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา โดยติดต่อผ่านช่องทางสนับสนุนของแอปพลิเคชัน
                </p>
            </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 animate-fade-in-up">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-blue-300 transition-colors">
                <div className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-all ${acceptedTerms ? 'bg-[#0056b3] border-[#0056b3]' : 'border-slate-300 bg-white'}`}>
                    {acceptedTerms && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />
                <span className="text-xs text-slate-600 font-kanit">
                    ข้าพเจ้าได้อ่านและยอมรับ <span className="font-bold text-[#0056b3]">ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service)</span>
                </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-blue-300 transition-colors">
                <div className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-all ${acceptedPrivacy ? 'bg-[#0056b3] border-[#0056b3]' : 'border-slate-300 bg-white'}`}>
                    {acceptedPrivacy && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={acceptedPrivacy} onChange={() => setAcceptedPrivacy(!acceptedPrivacy)} />
                <span className="text-xs text-slate-600 font-kanit">
                    ข้าพเจ้ายินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคลตาม <span className="font-bold text-[#0056b3]">นโยบายความเป็นส่วนตัว (Privacy Policy)</span>
                </span>
            </label>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-30">
        <button 
            onClick={onAccept}
            disabled={!acceptedTerms || !acceptedPrivacy}
            className="w-full py-4 bg-[#0056b3] text-white rounded-xl font-bold font-kanit shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 hover:bg-blue-700"
        >
            ยอมรับและดำเนินการต่อ (Accept & Continue)
        </button>
      </div>
    </div>
  );
};
