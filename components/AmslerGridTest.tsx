import React, { useState } from 'react';
import { Eye, CheckCircle, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

interface AmslerGridTestProps {
    onComplete: (result: 'Normal' | 'Abnormal') => void;
    onBack: () => void;
}

export const AmslerGridTest: React.FC<AmslerGridTestProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
    const [eyeSide, setEyeSide] = useState<'Left' | 'Right'>('Right');
    const [hasDistortion, setHasDistortion] = useState(false);

    const startTest = () => setStep('test');

    const handleAnswer = (abnormal: boolean) => {
        if (eyeSide === 'Right') {
            if (abnormal) setHasDistortion(true);
            setEyeSide('Left'); // Switch to next eye
        } else {
            // Finished both eyes
            if (abnormal) setHasDistortion(true);
            setStep('result');
            onComplete(hasDistortion || abnormal ? 'Abnormal' : 'Normal');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative">
            
            {step === 'intro' && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6 animate-fade-in">
                    <div className="p-4 bg-blue-50 rounded-full text-[#0056b3]">
                        <Eye className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 font-kanit">Amsler Grid Test</h3>
                        <p className="text-sm text-slate-500 font-kanit mt-2">
                            แบบทดสอบจุดภาพชัดเพื่อคัดกรอง<br/>โรคจอประสาทตาเสื่อม (Macular Degeneration)
                        </p>
                    </div>
                    <div className="text-left text-sm text-slate-600 bg-slate-50 p-4 rounded-xl space-y-2 font-kanit w-full">
                        <p>1. ถือโทรศัพท์ห่างจากตาประมาณ 30 ซม.</p>
                        <p>2. หากสวมแว่นตาอ่านหนังสือ ให้สวมไว้</p>
                        <p>3. ปิดตาข้างหนึ่ง แล้วมองที่จุดดำตรงกลาง</p>
                    </div>
                    <button 
                        onClick={startTest}
                        className="w-full py-3 bg-[#0056b3] text-white rounded-xl font-bold font-kanit shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
                    >
                        เริ่มทดสอบ (Start)
                    </button>
                    <button onClick={onBack} className="text-sm text-slate-400 font-kanit">ย้อนกลับ</button>
                </div>
            )}

            {step === 'test' && (
                <div className="flex flex-col h-full animate-fade-in">
                    <div className="p-4 bg-slate-900 text-white text-center font-kanit relative">
                         <span className="text-lg font-bold">ทดสอบตาข้าง: {eyeSide === 'Right' ? 'ขวา (Right)' : 'ซ้าย (Left)'}</span>
                         <p className="text-xs text-slate-300">ปิดตาข้าง {eyeSide === 'Right' ? 'ซ้าย' : 'ขวา'} แล้วมองจุดดำตรงกลาง</p>
                    </div>
                    
                    {/* The Grid */}
                    <div className="flex-1 flex items-center justify-center bg-white p-4">
                        <div className="relative w-64 h-64 border-2 border-black grid grid-cols-10 grid-rows-10">
                            {/* Grid Lines */}
                            {[...Array(9)].map((_, i) => (
                                <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-black opacity-30" style={{ left: `${(i+1)*10}%` }}></div>
                            ))}
                            {[...Array(9)].map((_, i) => (
                                <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-black opacity-30" style={{ top: `${(i+1)*10}%` }}></div>
                            ))}
                            {/* Center Dot */}
                            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <p className="text-center text-slate-800 font-bold mb-4 font-kanit">เส้นตารางดูบิดเบี้ยว หรือตามัว หรือไม่?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleAnswer(false)}
                                className="py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold font-kanit hover:bg-slate-100"
                            >
                                ปกติ (Normal)
                            </button>
                            <button 
                                onClick={() => handleAnswer(true)}
                                className="py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold font-kanit hover:bg-red-100"
                            >
                                ผิดปกติ (Abnormal)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'result' && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6 animate-fade-in">
                    <div className={`p-5 rounded-full ${hasDistortion ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {hasDistortion ? <AlertCircle className="h-12 w-12" /> : <CheckCircle className="h-12 w-12" />}
                    </div>
                    <div>
                        <h3 className={`text-2xl font-bold font-kanit ${hasDistortion ? 'text-red-600' : 'text-green-600'}`}>
                            {hasDistortion ? 'พบความผิดปกติ' : 'ปกติ (Normal)'}
                        </h3>
                        <p className="text-sm text-slate-500 font-kanit mt-3 leading-relaxed">
                            {hasDistortion 
                                ? "คุณอาจมีความเสี่ยงโรคจอประสาทตา ควรปรึกษาจักษุแพทย์เพื่อตรวจละเอียด" 
                                : "จากการคัดกรองเบื้องต้น ยังไม่พบความผิดปกติของจุดภาพชัด"}
                        </p>
                    </div>
                    
                    <button 
                        onClick={onBack}
                        className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold font-kanit shadow-lg hover:bg-black transition-colors"
                    >
                        กลับหน้าหลัก (Done)
                    </button>
                    
                    <button 
                         onClick={() => { setStep('intro'); setEyeSide('Right'); setHasDistortion(false); }}
                         className="flex items-center gap-2 text-sm text-slate-400 font-kanit"
                    >
                        <RefreshCw className="h-3 w-3" />
                        ทดสอบใหม่
                    </button>
                </div>
            )}
        </div>
    );
};