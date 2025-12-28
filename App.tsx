import React, { useState, useEffect } from 'react';
import { 
  Home,
  ShieldCheck,
  FileText,
  User, 
  LogOut, 
  ChevronRight, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useCases, useCaseDetail } from './hooks/usePatientData';
import { PatientDashboard } from './components/PatientDashboard';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { TermsScreen } from './components/TermsScreen';
import { CaseDetailView } from './components/CaseDetailView';
import { EyeCareCenter } from './components/EyeCareCenter';
import { Notification, NotificationType } from './components/Notification';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';
import { PatientCase, Tab, UserProfile } from './types';

// Default fallback user (used when API fails)
const DEFAULT_USER: UserProfile = {
    name: "Guest User",
    hn: "HN-000000",
    phoneNumber: "000-000-0000",
    gender: 'Other',
    dateOfBirth: '1990-01-01',
    weight: 0,
    height: 0,
    bmi: 0,
    avatarUrl: undefined
};

type AuthView = 'LOGIN' | 'TERMS' | 'REGISTER';

// Loading Spinner Component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'กำลังโหลด...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="h-10 w-10 text-[#0056b3] animate-spin" />
    <p className="mt-4 text-slate-500 font-kanit text-sm">{message}</p>
  </div>
);

// Error State Component
const ErrorState: React.FC<{ 
  message: string; 
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <AlertCircle className="h-8 w-8 text-red-500" />
    </div>
    <p className="text-slate-700 font-kanit text-center mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-kanit text-sm transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        ลองใหม่ (Retry)
      </button>
    )}
  </div>
);

// Empty State Component
const EmptyState: React.FC<{ 
  title: string; 
  message: string;
}> = ({ title, message }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <FileText className="h-8 w-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 font-kanit mb-2">{title}</h3>
    <p className="text-slate-500 font-kanit text-sm text-center">{message}</p>
  </div>
);

// Main App Content (uses AuthContext)
const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Fetch patient cases from API
  const { 
    cases: patientCases, 
    isLoading: casesLoading, 
    error: casesError, 
    isEmpty: casesEmpty,
    refetch: refetchCases 
  } = useCases();
  
  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // Selected case ID for detail view (fetch by ID)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  // Fetch selected case details
  const {
    caseData: selectedCase,
    isLoading: caseDetailLoading,
    error: caseDetailError,
    isUnauthorized,
    refetch: refetchCaseDetail
  } = useCaseDetail(selectedCaseId);
  
  // Onboarding State
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Show welcome modal once on first login
  useEffect(() => {
    if (isAuthenticated && !hasShownWelcome) {
      setShowWelcome(true);
      setHasShownWelcome(true);
    }
  }, [isAuthenticated, hasShownWelcome]);

  // Handle unauthorized access to case detail
  useEffect(() => {
    if (isUnauthorized) {
      showNotification(
        'ไม่มีสิทธิ์เข้าถึง',
        'คุณไม่มีสิทธิ์ดูข้อมูลนี้ กรุณาติดต่อเจ้าหน้าที่',
        'error'
      );
      setSelectedCaseId(null);
    }
  }, [isUnauthorized]);

  const showNotification = (title: string, message: string, type: NotificationType = 'info') => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogin = () => {
    // Auth state is managed by AuthContext
    setAuthView('LOGIN');
  };
  
  const handleRegister = () => {
    // Auth state is managed by AuthContext
    setAuthView('LOGIN');
  };

  const handleLogout = () => {
    logout();
    setActiveTab(Tab.HOME);
    setSelectedCaseId(null);
    setHasShownWelcome(false);
  };

  const handleSelectCase = (caseItem: PatientCase) => {
    setSelectedCaseId(caseItem.id);
  };

  const handleBackFromCaseDetail = () => {
    setSelectedCaseId(null);
  };

  // Get user profile (from auth or fallback)
  const userProfile: UserProfile = currentUser || DEFAULT_USER;

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#0056b3] animate-spin" />
          <p className="text-slate-500 font-kanit">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // --- Auth Flow Rendering ---
  if (!isAuthenticated) {
    switch (authView) {
        case 'TERMS':
            return <TermsScreen onAccept={() => setAuthView('REGISTER')} onBack={() => setAuthView('LOGIN')} />;
        case 'REGISTER':
            return <RegisterScreen onRegister={handleRegister} onSwitchToLogin={() => setAuthView('LOGIN')} />;
        case 'LOGIN':
        default:
            return <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setAuthView('TERMS')} />;
    }
  }

  // --- Authenticated Views ---

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#f8faff] relative overflow-hidden text-slate-800">
      
      {/* Global Notification Modal */}
      <Notification 
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        actionLabel={notification.actionLabel}
        onAction={notification.onAction}
      />

      {/* Welcome Guide Modal */}
      {showWelcome && (
        <WelcomeGuideModal onAccept={() => setShowWelcome(false)} />
      )}

      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-15%] right-[-35%] w-[80%] h-[50%] bg-blue-100/40 rounded-full blur-[80px] opacity-70"></div>
          <div className="absolute bottom-[-15%] left-[-35%] w-[80%] h-[50%] bg-green-100/40 rounded-full blur-[80px] opacity-60"></div>
          <div className="absolute top-[40%] left-[20%] w-[40%] h-[20%] bg-purple-100/30 rounded-full blur-[60px] opacity-40"></div>
      </div>

      {/* Top Bar (Simplified for Patient) */}
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-30">
        <div>
           <h1 className="text-xl font-bold text-slate-800 font-kanit tracking-tight">POLA<span className="text-[#0056b3]">CARE</span></h1>
           <p className="text-[10px] text-slate-400 font-kanit uppercase tracking-wider">Patient Portal</p>
        </div>
        <div 
            onClick={() => setActiveTab(Tab.PROFILE)}
            className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:border-[#0056b3] transition-colors overflow-hidden"
        >
            {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Me" className="h-full w-full object-cover" />
            ) : (
                <User className="h-5 w-5 text-slate-500" />
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        
        {/* Case Detail View Overlay */}
        {selectedCaseId && (
            <div className="absolute inset-0 z-50 bg-[#f8faff]">
                {caseDetailLoading ? (
                  <div className="flex flex-col h-full">
                    <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center gap-3">
                      <button 
                        onClick={handleBackFromCaseDetail}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600"
                      >
                        <ChevronRight className="h-6 w-6 rotate-180" />
                      </button>
                      <span className="font-kanit text-slate-600">กำลังโหลด...</span>
                    </div>
                    <LoadingSpinner message="กำลังโหลดข้อมูลการตรวจ..." />
                  </div>
                ) : caseDetailError ? (
                  <div className="flex flex-col h-full">
                    <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center gap-3">
                      <button 
                        onClick={handleBackFromCaseDetail}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600"
                      >
                        <ChevronRight className="h-6 w-6 rotate-180" />
                      </button>
                      <span className="font-kanit text-slate-600">เกิดข้อผิดพลาด</span>
                    </div>
                    <ErrorState 
                      message={caseDetailError} 
                      onRetry={refetchCaseDetail} 
                    />
                  </div>
                ) : selectedCase ? (
                  <CaseDetailView 
                    data={selectedCase} 
                    onBack={handleBackFromCaseDetail} 
                    onShowNotification={showNotification}
                  />
                ) : null}
            </div>
        )}

        {/* HOME VIEW */}
        {activeTab === Tab.HOME && !selectedCaseId && (
            <div className="animate-fade-in">
                <PatientDashboard 
                    userProfile={userProfile}
                    onNavigateToCare={() => setActiveTab(Tab.CARE)}
                    onNavigateToRecords={() => setActiveTab(Tab.RECORDS)}
                    onShowNotification={showNotification}
                />
            </div>
        )}

        {/* CARE CENTER VIEW (Articles, Tests) */}
        {activeTab === Tab.CARE && !selectedCaseId && (
            <div className="h-full animate-fade-in">
                <EyeCareCenter onShowNotification={showNotification} />
            </div>
        )}

        {/* RECORDS VIEW (History) - Now with real API data */}
        {activeTab === Tab.RECORDS && !selectedCaseId && (
            <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 font-kanit">ประวัติการรักษา (My Records)</h2>
                    {!casesLoading && !casesEmpty && (
                      <button 
                        onClick={refetchCases}
                        className="flex items-center gap-1 text-xs text-[#0056b3] font-kanit hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        รีเฟรช
                      </button>
                    )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Loading State */}
                    {casesLoading && (
                      <LoadingSpinner message="กำลังโหลดประวัติการรักษา..." />
                    )}

                    {/* Error State */}
                    {!casesLoading && casesError && (
                      <ErrorState 
                        message={casesError} 
                        onRetry={refetchCases} 
                      />
                    )}

                    {/* Empty State */}
                    {!casesLoading && !casesError && casesEmpty && (
                      <EmptyState 
                        title="ยังไม่มีประวัติการรักษา"
                        message="เมื่อคุณได้รับการตรวจรักษา ข้อมูลจะแสดงที่นี่"
                      />
                    )}

                    {/* Records List */}
                    {!casesLoading && !casesError && patientCases.length > 0 && (
                        <div className="divide-y divide-slate-100">
                            {patientCases.map(record => (
                                <div 
                                    key={record.id}
                                    onClick={() => handleSelectCase(record)}
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-4"
                                >
                                    <div className="h-14 w-14 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 relative">
                                        <img 
                                          src={record.imageUrl} 
                                          alt="Exam" 
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image';
                                          }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-slate-800 font-kanit text-sm truncate">
                                              {record.diagnosis || 'รอวินิจฉัย'}
                                            </h3>
                                            <span className="text-xs text-slate-400 font-inter flex-shrink-0">
                                              {record.date.toLocaleDateString('th-TH')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-kanit mt-1 line-clamp-1">
                                          {record.aiAnalysisText || 'ไม่มีบันทึกเพิ่มเติม'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                              record.status === 'Finalized' 
                                                ? 'bg-green-50 text-green-600' 
                                                : 'bg-yellow-50 text-yellow-600'
                                            }`}>
                                                {record.status === 'Finalized' ? (
                                                  <>
                                                    <CheckCircle2 className="h-3 w-3" /> 
                                                    Completed
                                                  </>
                                                ) : (
                                                  'Draft'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === Tab.PROFILE && !selectedCaseId && (
             <div className="p-6 animate-fade-in flex flex-col items-center">
                 <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden relative z-10">
                    {userProfile.avatarUrl ? (
                         <img src={userProfile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-12 w-12 text-slate-400" />
                    )}
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 font-kanit">{userProfile.name}</h2>
                 <p className="text-sm text-slate-500 font-kanit mb-1">HN: {userProfile.hn}</p>
                 <p className="text-xs text-slate-400 font-kanit mb-8">Patient Account</p>
                 
                 <div className="w-full max-w-sm space-y-3">
                    <button 
                        onClick={() => showNotification('ข้อมูลส่วนตัว', 'ระบบแก้ไขข้อมูลส่วนตัวกำลังอยู่ระหว่างการพัฒนา', 'info')}
                        className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm text-sm font-kanit font-bold text-slate-700 hover:bg-white transition-colors"
                    >
                        <span>ข้อมูลส่วนตัว (Personal Info)</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                        onClick={() => showNotification('การนัดหมาย', 'ระบบจัดการการนัดหมายกำลังอยู่ระหว่างการพัฒนา', 'info')}
                        className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm text-sm font-kanit font-bold text-slate-700 hover:bg-white transition-colors"
                    >
                        <span>การนัดหมาย (Appointments)</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/50 border border-red-100 text-red-600 rounded-xl font-bold font-kanit hover:bg-red-50 transition-colors mt-8"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                 </div>
             </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-200/60 px-6 py-2 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40 pb-5 pt-3">
         <button 
           onClick={() => { setActiveTab(Tab.HOME); setSelectedCaseId(null); }}
           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.HOME && !selectedCaseId ? 'text-[#0056b3]' : 'text-slate-400'}`}
         >
            <Home className={`h-6 w-6 ${activeTab === Tab.HOME && !selectedCaseId ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium font-kanit">Home</span>
         </button>

         <button 
           onClick={() => { setActiveTab(Tab.RECORDS); setSelectedCaseId(null); }}
           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.RECORDS || selectedCaseId ? 'text-[#0056b3]' : 'text-slate-400'}`}
         >
            <FileText className="h-6 w-6" />
            <span className="text-[10px] font-medium font-kanit">Records</span>
         </button>

         <button 
           onClick={() => setActiveTab(Tab.CARE)}
           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.CARE ? 'text-[#0056b3]' : 'text-slate-400'}`}
         >
            <ShieldCheck className="h-6 w-6" />
            <span className="text-[10px] font-medium font-kanit">Care</span>
         </button>
         
         <button 
           onClick={() => { setActiveTab(Tab.PROFILE); setSelectedCaseId(null); }}
           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.PROFILE ? 'text-[#0056b3]' : 'text-slate-400'}`}
         >
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium font-kanit">Me</span>
         </button>
      </div>
    </div>
  );
};

// Root App with Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
