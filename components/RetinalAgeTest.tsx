import React, { useState, useRef } from 'react';
import { Eye, Upload, Calendar, ArrowRight, Activity, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, ScanEye } from 'lucide-react';
import { analyzeRetinalAge } from '../services/geminiService';
import { RetinalAgeResult } from '../types';

interface RetinalAgeTestProps {
    onBack: () => void;
}

export const RetinalAgeTest: React.FC<RetinalAgeTestProps> = ({ onBack }) => {
    const [step, setStep] = useState<'input' | 'upload' | 'analyzing' | 'result'>('input');
    const [age, setAge] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<RetinalAgeResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNextToUpload = () => {
        if (age && !isNaN(Number(age)) && Number(age) > 0) {
            setStep('upload');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            setImagePreview(base64String);
            setStep('analyzing');

            // Simulate a minimum scan time for effect
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
            const analysisPromise = analyzeRetinalAge(base64Data, file.type, Number(age));

            const [_, analysisResult] = await Promise.all([minTimePromise, analysisPromise]);

            if (analysisResult) {
                setResult(analysisResult);
                setStep('result');
            } else {
                // Handle Error
                setStep('upload');
                alert("เกิดข้อผิดพลาดในการวิเคราะห์ โปรดลองใหม่อีกครั้ง");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative animate-fade-in">
            {/* Header / Nav */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                    <ArrowRight className="h-5 w-5 rotate-180" />
                 </button>
                 <h2 className="text-lg font-bold text-slate-800 font-kanit">Retinal Age Analysis</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* STEP 1: Input Age */}
                {step === 'input' && (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center text-[#0056b3] mb-4">
                            <Calendar className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-kanit">ระบุอายุจริงของคุณ</h3>
                        <p className="text-sm text-slate-500 font-kanit max-w-xs">
                            เราต้องใช้อายุจริงเพื่อเปรียบเทียบกับอายุทางชีวภาพของหลอดเลือดในดวงตา
                        </p>
                        
                        <div className="w-full max-w-[200px]">
                            <input 
                                type="number" 
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Age (e.g. 45)"
                                className="w-full text-center text-3xl font-bold py-4 rounded-2xl border-2 border-slate-200 focus:border-[#0056b3] outline-none text-slate-700 placeholder:text-slate-300 font-kanit"
                                autoFocus
                            />
                        </div>

                        <button 
                            onClick={handleNextToUpload}
                            disabled={!age}
                            className="w-full py-3 bg-[#0056b3] text-white rounded-xl font-bold font-kanit shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            ถัดไป (Next)
                        </button>
                    </div>
                )}

                {/* STEP 2: Upload */}
                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                        <div className="h-20 w-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4 animate-pulse">
                            <ScanEye className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-kanit">อัปโหลดภาพจอประสาทตา</h3>
                        <p className="text-sm text-slate-500 font-kanit max-w-xs">
                            กรุณาใช้ภาพถ่าย Fundus Image ที่ชัดเจนเพื่อผลลัพธ์ที่แม่นยำ
                        </p>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-purple-400 transition-colors"
                        >
                            <Upload className="h-8 w-8 text-slate-400" />
                            <span className="text-sm text-slate-400 font-kanit">แตะเพื่ออัปโหลดรูปภาพ</span>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>
                )}

                {/* STEP 3: Analyzing */}
                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
                        {/* Background Image with Overlay */}
                        {imagePreview && (
                            <div className="absolute inset-0 z-0">
                                <img src={imagePreview} className="w-full h-full object-cover opacity-20 blur-sm" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white"></div>
                            </div>
                        )}
                        
                        {/* Scanning Line */}
                        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                            <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-0 animate-[scan_3s_ease-in-out_infinite]"></div>
                        </div>

                        <div className="relative z-20 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 text-center">
                             <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Activity className="h-8 w-8 text-[#0056b3] animate-bounce" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 font-kanit">AI กำลังวิเคราะห์...</h3>
                             <p className="text-xs text-slate-500 font-kanit mt-2">กำลังประเมินความหนาแน่นของเส้นเลือด<br/>และสุขภาพจอประสาทตา</p>
                        </div>
                    </div>
                )}

                {/* STEP 4: Result */}
                {step === 'result' && result && (
                    <div className="p-6 space-y-6 animate-fade-in-up">
                        {result.riskFactors.includes("Invalid Image") ? (
                             <div className="bg-red-50 p-6 rounded-2xl text-center space-y-4 border border-red-100">
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-red-700 font-kanit">ไม่สามารถวิเคราะห์ได้</h3>
                                <p className="text-sm text-red-600/80 font-kanit">{result.analysisText}</p>
                                <button onClick={() => setStep('upload')} className="px-6 py-2 bg-white border border-red-200 rounded-lg text-red-600 text-sm font-bold shadow-sm">ลองใหม่อีกครั้ง</button>
                             </div>
                        ) : (
                            <>
                                {/* Score Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-2 ${result.gap > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                    
                                    <p className="text-sm text-slate-500 font-kanit uppercase tracking-wider mb-2">Estimated Retinal Age</p>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <h1 className="text-6xl font-bold text-slate-800 font-kanit">{result.predictedAge}</h1>
                                        <span className="text-lg text-slate-400 font-kanit">years</span>
                                    </div>
                                    
                                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold font-kanit ${
                                        result.gap > 0 
                                        ? 'bg-orange-50 text-orange-600' 
                                        : 'bg-green-50 text-green-600'
                                    }`}>
                                        {result.gap > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {Math.abs(result.gap)} Years {result.gap > 0 ? 'Older' : 'Younger'} than actual
                                    </div>
                                </div>

                                {/* Analysis Text */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-700 font-kanit mb-2 flex items-center gap-2">
                                        <ScanEye className="h-4 w-4 text-[#0056b3]" />
                                        ผลการวิเคราะห์ AI
                                    </h4>
                                    <p className="text-sm text-slate-600 font-kanit leading-relaxed">
                                        {result.analysisText}
                                    </p>
                                </div>

                                {/* Risk Factors Tags */}
                                <div>
                                    <h4 className="font-bold text-slate-700 font-kanit mb-3 text-sm">ปัจจัยเสี่ยงที่ตรวจพบ (Observed Factors)</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.riskFactors.map((factor, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium font-kanit">
                                                {factor}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setStep('input')}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold font-kanit shadow-lg mt-4"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    ทดสอบอีกครั้ง
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};