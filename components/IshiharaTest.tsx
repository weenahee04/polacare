import React, { useState } from 'react';
import { Eye, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Palette } from 'lucide-react';

interface IshiharaTestProps {
    onComplete: (result: 'Normal' | 'Abnormal') => void;
    onBack: () => void;
}

const PLATES = [
    { id: 1, number: 12, options: [12, 8, 3, 'Nothing'], correct: 12, type: 'demo' },
    { id: 2, number: 8, options: [8, 3, 5, 'Nothing'], correct: 8, type: 'test' },
    { id: 3, number: 29, options: [29, 70, 19, 'Nothing'], correct: 29, type: 'test' },
    { id: 4, number: 5, options: [5, 2, 7, 'Nothing'], correct: 5, type: 'test' },
    { id: 5, number: 42, options: [42, 4, 2, 'Nothing'], correct: 42, type: 'test' },
];

const MockPlate = ({ number }: { number: number }) => {
    return (
        <div className="relative w-64 h-64 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-200 shadow-inner">
             {/* Simulated Dot Pattern Background */}
             <div className="absolute inset-0 opacity-60" style={{ 
                 backgroundImage: `
                    radial-gradient(circle at 10% 20%, #86efac 4px, transparent 5px), 
                    radial-gradient(circle at 90% 80%, #4ade80 6px, transparent 7px),
                    radial-gradient(circle at 50% 50%, #16a34a 3px, transparent 4px),
                    radial-gradient(circle at 30% 70%, #bbf7d0 5px, transparent 6px),
                    radial-gradient(circle at 70% 30%, #22c55e 4px, transparent 5px)
                 `, 
                 backgroundSize: '40px 40px'
             }}></div>
             
             {/* The Number */}
             <span className="relative z-10 text-9xl font-bold text-orange-500/80 tracking-tighter blur-[0.5px] select-none" style={{ 
                 fontFamily: '"Times New Roman", serif',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.1)' 
             }}>
                {number}
             </span>
             
             {/* Foreground Noise to simulate blending */}
             <div className="absolute inset-0 z-20 opacity-40 mix-blend-multiply pointer-events-none" style={{ 
                 backgroundImage: `
                    radial-gradient(circle at 15% 15%, #fb923c 3px, transparent 4px), 
                    radial-gradient(circle at 85% 85%, #fdba74 4px, transparent 5px)
                 `, 
                 backgroundSize: '30px 30px'
             }}></div>
        </div>
    );
};

export const IshiharaTest: React.FC<IshiharaTestProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
    const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
    const [score, setScore] = useState(0);

    const startTest = () => {
        setScore(0);
        setCurrentPlateIndex(0);
        setStep('test');
    };

    const handleAnswer = (answer: number | string) => {
        const isCorrect = answer === PLATES[currentPlateIndex].correct;
        // Demo plate (index 0) doesn't typically count towards "deficiency" score in same way, 
        // but for simplicity we just count correct answers.
        if (isCorrect) {
            setScore(s => s + 1);
        }

        if (currentPlateIndex < PLATES.length - 1) {
            setCurrentPlateIndex(prev => prev + 1);
        } else {
            // Finish
            const finalScore = score + (isCorrect ? 1 : 0);
            const passed = finalScore >= 4; // Allow 1 mistake (usually demo + 3 real)
            setStep('result');
            // Pass the result up after a brief delay or immediately? Immediate is fine for local state.
            // We'll call onComplete when user clicks "Done" or here.
        }
    };

    const currentPlate = PLATES[currentPlateIndex];

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative animate-fade-in">
            
            {step === 'intro' && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6">
                    <div className="p-4 bg-orange-50 rounded-full text-orange-500">
                        <Palette className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 font-kanit">Color Blindness Test</h3>
                        <p className="text-sm text-slate-500 font-kanit mt-2">
                            แบบทดสอบตาบอดสี (Ishihara Test)<br/>เพื่อคัดกรองความผิดปกติในการมองเห็นสี
                        </p>
                    </div>
                    <div className="text-left text-sm text-slate-600 bg-slate-50 p-4 rounded-xl space-y-2 font-kanit w-full">
                        <p>1. ปรับความสว่างหน้าจอให้พอดี</p>
                        <p>2. ถือโทรศัพท์ในระยะอ่านหนังสือ</p>
                        <p>3. เลือกตัวเลขที่คุณมองเห็นในภาพ</p>
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
                <div className="flex flex-col h-full">
                    <div className="p-4 bg-slate-900 text-white text-center font-kanit">
                         <span className="text-lg font-bold">Plate {currentPlateIndex + 1} / {PLATES.length}</span>
                         <p className="text-xs text-slate-300">What number do you see?</p>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
                        <MockPlate number={currentPlate.number} />
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3">
                            {currentPlate.options.map((opt, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleAnswer(opt)}
                                    className="py-4 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-lg font-kanit hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 'result' && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-6 animate-fade-in">
                    <div className={`p-5 rounded-full ${score >= 4 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {score >= 4 ? <CheckCircle className="h-12 w-12" /> : <AlertCircle className="h-12 w-12" />}
                    </div>
                    <div>
                        <h3 className={`text-2xl font-bold font-kanit ${score >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                            {score >= 4 ? 'สายตาปกติ (Normal)' : 'พบความเสี่ยง (Risk Found)'}
                        </h3>
                        <p className="text-sm text-slate-500 font-kanit mt-3 leading-relaxed">
                            {score >= 4
                                ? "คุณสามารถแยกแยะสีได้ปกติ ไม่พบสัญญาณของตาบอดสี" 
                                : "คุณอาจมีความผิดปกติในการมองเห็นสีเขียว-แดง ควรปรึกษาจักษุแพทย์"}
                        </p>
                        <p className="text-xs text-slate-400 font-kanit mt-2">Score: {score} / {PLATES.length}</p>
                    </div>
                    
                    <button 
                        onClick={() => onComplete(score >= 4 ? 'Normal' : 'Abnormal')}
                        className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold font-kanit shadow-lg hover:bg-black transition-colors"
                    >
                        บันทึกผล (Save Result)
                    </button>
                    
                    <button 
                         onClick={startTest}
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