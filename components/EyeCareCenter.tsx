import React, { useState, useEffect } from 'react';
import { Eye, Droplets, Calendar, Activity, ChevronRight, Plus, Check, Clock, Video, FileText, Palette, BookOpen, Phone, X, Pill, ScanEye, Brain, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { VisionTestResult, Article } from '../types';
import { useMedications, Medication } from '../hooks/usePatientData';
import { AmslerGridTest } from './AmslerGridTest';
import { IshiharaTest } from './IshiharaTest';
import { RetinalAgeTest } from './RetinalAgeTest';
import { ArticleCard } from './ArticleCard';
import { ArticleReader } from './ArticleReader';

interface EyeCareCenterProps {
    onShowNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

// Mock Articles for Eye Care (to be wired to API later)
const EYE_ARTICLES: Article[] = [
    {
        id: 'e1',
        title: 'Computer Vision Syndrome: อาการตาล้าจากหน้าจอที่คนทำงานต้องระวัง',
        category: 'Eye Care',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
        readTime: '4 min',
        date: '10 Oct 2023'
    },
    {
        id: 'e2',
        title: 'ต้อหิน (Glaucoma) ภัยเงียบที่ขโมยการมองเห็นของคุณ',
        category: 'Eye Care',
        imageUrl: 'https://images.unsplash.com/photo-1579684385136-4f8995f52a76?auto=format&fit=crop&q=80&w=200',
        readTime: '6 min',
        date: '05 Oct 2023'
    }
];

// Helper to format last taken time
function formatLastTaken(lastTakenAt: string | null | undefined): string {
    if (!lastTakenAt) return 'ยังไม่เคยใช้';
    
    const date = new Date(lastTakenAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'เพิ่งใช้';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays === 1) return 'เมื่อวาน';
    return `${diffDays} วันที่แล้ว`;
}

// Helper to check if medication was taken today
function wasTakenToday(lastTakenAt: string | null | undefined): boolean {
    if (!lastTakenAt) return false;
    const date = new Date(lastTakenAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

export const EyeCareCenter: React.FC<EyeCareCenterProps> = ({ onShowNotification }) => {
    const [view, setView] = useState<'dashboard' | 'amsler' | 'ishihara' | 'retinal'>('dashboard');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);

    // Use real medications from API
    const { 
        medications, 
        adherence,
        isLoading: medsLoading, 
        isLogging,
        error: medsError, 
        isEmpty: medsEmpty,
        refetch: refetchMeds,
        logMedicationTaken,
        createMedication,
        deleteMedication
    } = useMedications();

    const [lastTestResult, setLastTestResult] = useState<VisionTestResult | null>({
        testName: 'Amsler Grid',
        date: new Date(),
        result: 'Normal',
        details: 'No distortion detected.'
    });

    // Add Medicine Modal State
    const [showAddMedicine, setShowAddMedicine] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        frequency: '',
        time: '',
        type: 'drop' as 'drop' | 'pill' | 'other'
    });

    // Track which medication is being logged
    const [loggingMedId, setLoggingMedId] = useState<string | null>(null);

    const handleMarkTaken = async (med: Medication) => {
        if (isLogging || loggingMedId) return;
        
        setLoggingMedId(med.id);
        
        const success = await logMedicationTaken(med.id);
        
        if (success) {
            onShowNotification(
                'บันทึกเรียบร้อย ✓', 
                `บันทึกการใช้ยา ${med.medicineName} แล้ว`, 
                'success'
            );
        } else {
            onShowNotification(
                'เกิดข้อผิดพลาด', 
                'ไม่สามารถบันทึกการใช้ยาได้ กรุณาลองใหม่', 
                'error'
            );
        }
        
        setLoggingMedId(null);
    };

    const handleAddMedicine = async () => {
        if (!newMed.name || !newMed.time) {
            onShowNotification('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อยาและเวลาให้ครบถ้วน', 'error');
            return;
        }
        
        setIsSubmitting(true);

        const success = await createMedication({
            medicineName: newMed.name,
            type: newMed.type,
            frequency: newMed.frequency || 'Daily',
            nextTime: newMed.time
        });

        setIsSubmitting(false);

        if (success) {
            setShowAddMedicine(false);
            setNewMed({ name: '', frequency: '', time: '', type: 'drop' });
            onShowNotification('เพิ่มรายการยาสำเร็จ', 'รายการยาใหม่ถูกเพิ่มในตารางแล้ว', 'success');
        } else {
            onShowNotification('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มรายการยาได้ กรุณาลองใหม่', 'error');
        }
    };

    const handleTestComplete = (testName: string, result: 'Normal' | 'Abnormal') => {
        setLastTestResult({
            testName: testName,
            date: new Date(),
            result: result,
            details: result === 'Normal' ? 'No abnormalities detected.' : 'Potential issues detected.'
        });
        setView('dashboard');
        onShowNotification('บันทึกผลการทดสอบ', `ผลการทดสอบ ${testName}: ${result}`, result === 'Normal' ? 'success' : 'warning');
    };

    // Render Views
    if (readingArticle) {
        return <ArticleReader article={readingArticle} onClose={() => setReadingArticle(null)} />;
    }

    if (view === 'amsler') {
        return <AmslerGridTest onComplete={(res) => handleTestComplete('Amsler Grid', res)} onBack={() => setView('dashboard')} />;
    }

    if (view === 'ishihara') {
        return <IshiharaTest onComplete={(res) => handleTestComplete('Color Blindness', res)} onBack={() => setView('dashboard')} />;
    }

    if (view === 'retinal') {
        return <RetinalAgeTest onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="h-full bg-slate-50 overflow-y-auto pb-24 animate-fade-in relative">
            {/* Header */}
            <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm border-b border-slate-100 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-kanit flex items-center gap-2">
                            <Eye className="h-6 w-6 text-[#0056b3]" />
                            Eye Care Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-kanit">ศูนย์ดูแลสุขภาพดวงตาครบวงจร</p>
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold font-kanit flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {adherence ? `${adherence.rate.toFixed(0)}% Adherence` : 'Healthy'}
                    </div>
                </div>

                {/* Main Action Banner - Telemedicine */}
                <div 
                    onClick={() => onShowNotification('Telemedicine', 'ระบบปรึกษาแพทย์ออนไลน์กำลังอยู่ระหว่างการพัฒนา', 'info')}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white shadow-lg cursor-pointer transform transition-transform active:scale-95"
                >
                     <div className="absolute right-0 top-0 h-24 w-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                     <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-base sm:text-lg font-kanit">ปรึกษาจักษุแพทย์ออนไลน์</h3>
                                <p className="text-xs text-emerald-100 font-kanit mt-1 opacity-90 max-w-[200px]">
                                    Video Call กับคุณหมอผู้เชี่ยวชาญได้โดยตรง ไม่ต้องเดินทาง
                                </p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Video className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md">
                            <Phone className="h-3 w-3" />
                            โทรปรึกษา (Call Now)
                        </div>
                     </div>
                </div>
            </div>

            <div className="px-4 sm:px-5 py-6 space-y-6">
                
                {/* 1. Screening Tools Section */}
                <div>
                    <h3 className="text-sm font-bold text-slate-700 font-kanit mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#0056b3]" />
                        Vision Screening (ทดสอบสายตา)
                    </h3>
                    
                    {/* Featured Tool: Retinal Age */}
                    <div 
                        onClick={() => setView('retinal')}
                        className="mb-3 bg-gradient-to-r from-[#0f172a] to-[#334155] rounded-2xl p-4 shadow-md flex items-center justify-between text-white cursor-pointer group hover:shadow-lg transition-all"
                    >
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Brain className="h-6 w-6 text-blue-300" />
                            </div>
                            <div>
                                <h4 className="font-bold font-kanit text-sm sm:text-base">AI Retinal Age Scan</h4>
                                <p className="text-xs text-slate-300 font-kanit">วิเคราะห์อายุหลอดเลือดตาด้วย AI</p>
                            </div>
                         </div>
                         <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                             <ChevronRight className="h-5 w-5" />
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setView('amsler')}
                            className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:border-blue-200 transition-colors group active:bg-slate-50"
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0056b3] group-hover:bg-blue-100 transition-colors">
                                <div className="grid grid-cols-2 gap-0.5">
                                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 font-kanit">Amsler Grid</span>
                            <span className="text-[10px] text-slate-400 font-kanit">จอประสาทตา</span>
                        </button>
                        
                        <button 
                            onClick={() => setView('ishihara')}
                            className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:border-orange-200 transition-colors group active:bg-slate-50"
                        >
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                                <Palette className="h-5 w-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 font-kanit">Color Blind</span>
                            <span className="text-[10px] text-slate-400 font-kanit">ตาบอดสี</span>
                        </button>
                    </div>

                    {/* Recent Result */}
                    {lastTestResult && (
                        <div className="mt-3 bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${lastTestResult.result === 'Normal' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 font-kanit">ล่าสุด: {lastTestResult.testName}</p>
                                    <p className="text-[10px] text-slate-400 font-kanit">{lastTestResult.date.toLocaleDateString()} • {lastTestResult.result}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                    )}
                </div>

                {/* 2. Medicine/Eye Drop Tracker - Now with real API data */}
                <div>
                     <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-700 font-kanit flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-[#0056b3]" />
                            My Medications (ยาของฉัน)
                        </h3>
                        <div className="flex items-center gap-2">
                            {!medsLoading && !medsEmpty && (
                                <button 
                                    onClick={refetchMeds}
                                    className="p-1 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            )}
                            <button 
                                onClick={() => setShowAddMedicine(true)}
                                className="p-1 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        {/* Loading State */}
                        {medsLoading && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 text-[#0056b3] animate-spin" />
                                <p className="mt-2 text-xs text-slate-500 font-kanit">กำลังโหลดรายการยา...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {!medsLoading && medsError && (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                                <p className="text-sm text-slate-600 font-kanit mb-2">{medsError}</p>
                                <button 
                                    onClick={refetchMeds}
                                    className="text-xs text-[#0056b3] font-bold font-kanit hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className="h-3 w-3" /> ลองใหม่
                                </button>
                            </div>
                        )}

                        {/* Medications List */}
                        {!medsLoading && !medsError && medications.map(med => {
                            const isTakenToday = wasTakenToday(med.lastTakenAt);
                            const isLoggingThis = loggingMedId === med.id;
                            
                            return (
                                <div key={med.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${med.type === 'drop' ? 'bg-cyan-50 text-cyan-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {med.type === 'drop' ? <Droplets className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 font-kanit truncate">{med.medicineName}</h4>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-kanit">{med.frequency}</span>
                                                <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                                                    <Clock className="h-3 w-3" /> {med.nextTime}
                                                </span>
                                            </div>
                                            {/* Last Taken Time */}
                                            <p className="text-[10px] text-slate-400 font-kanit mt-1">
                                                ล่าสุด: {formatLastTaken(med.lastTakenAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleMarkTaken(med)}
                                        disabled={isLogging || isLoggingThis}
                                        className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ml-2 ${
                                            isTakenToday 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'bg-white border-slate-200 text-slate-300 hover:border-green-400 hover:text-green-400'
                                        } ${(isLogging || isLoggingThis) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoggingThis ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" strokeWidth={3} />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                        
                        {/* Empty State */}
                        {!medsLoading && !medsError && medsEmpty && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-sm text-slate-400 font-kanit">ยังไม่มีรายการยา</p>
                                <button onClick={() => setShowAddMedicine(true)} className="text-xs text-[#0056b3] font-bold mt-2 font-kanit hover:underline">
                                    + เพิ่มรายการยา
                                </button>
                            </div>
                        )}
                     </div>
                </div>

                {/* 3. Eye Health Articles */}
                <div>
                    <h3 className="text-sm font-bold text-slate-700 font-kanit mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#0056b3]" />
                        บทความสุขภาพตา (Eye Health Insights)
                    </h3>
                    <div className="space-y-3">
                        {EYE_ARTICLES.map(article => (
                            <ArticleCard key={article.id} article={article} onClick={() => setReadingArticle(article)} />
                        ))}
                    </div>
                </div>

                {/* 4. Appointment Teaser */}
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-xl text-orange-500 shadow-sm">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                         <h4 className="text-sm font-bold text-orange-800 font-kanit">นัดหมายจักษุแพทย์</h4>
                         <p className="text-xs text-orange-600/80 font-kanit mt-1">
                            ครบกำหนดตรวจสุขภาพตาประจำปีในอีก 2 เดือน
                         </p>
                         <button 
                            onClick={() => onShowNotification('จองคิวตรวจ', 'ระบบนัดหมายออนไลน์กำลังอยู่ระหว่างการปรับปรุง', 'info')}
                            className="mt-2 text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm"
                        >
                            จองคิวตรวจ (Book Now)
                         </button>
                    </div>
                </div>
            </div>

            {/* Add Medicine Modal */}
            {showAddMedicine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-scale-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 font-kanit">เพิ่มรายการยา (Add Meds)</h3>
                            <button 
                                onClick={() => setShowAddMedicine(false)} 
                                disabled={isSubmitting}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 font-kanit">ชื่อยา (Medicine Name)</label>
                                <input 
                                    type="text" 
                                    value={newMed.name}
                                    onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                                    placeholder="Ex. Tears Naturale"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-kanit outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] disabled:opacity-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 font-kanit">ความถี่ (Frequency)</label>
                                    <input 
                                        type="text" 
                                        value={newMed.frequency}
                                        onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                                        placeholder="Ex. 4 times/day"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-kanit outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 font-kanit">เวลาถัดไป (Next Time)</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time}
                                        onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-kanit outline-none focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3] disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 font-kanit">ประเภท (Type)</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setNewMed({...newMed, type: 'drop'})}
                                        disabled={isSubmitting}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold font-kanit transition-all flex items-center justify-center gap-2 ${newMed.type === 'drop' ? 'bg-white shadow text-[#0056b3]' : 'text-slate-500'} disabled:opacity-50`}
                                    >
                                        <Droplets className="h-3 w-3" /> ยาหยอด (Drop)
                                    </button>
                                    <button 
                                        onClick={() => setNewMed({...newMed, type: 'pill'})}
                                        disabled={isSubmitting}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold font-kanit transition-all flex items-center justify-center gap-2 ${newMed.type === 'pill' ? 'bg-white shadow text-purple-600' : 'text-slate-500'} disabled:opacity-50`}
                                    >
                                        <Pill className="h-3 w-3" /> ยาทาน (Pill)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button 
                                onClick={() => setShowAddMedicine(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold font-kanit hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleAddMedicine}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-[#0056b3] text-white rounded-xl font-bold font-kanit shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    'บันทึก'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
