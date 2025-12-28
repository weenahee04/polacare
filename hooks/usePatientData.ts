/**
 * Patient Data Hooks
 * 
 * Reusable hooks for fetching patient-specific data:
 * - useProfile: Get/update user profile
 * - useCases: Get patient cases list
 * - useCaseDetail: Get single case by ID
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.mock';
import { apiService, ApiError } from '../services/apiService';
import { PatientCase, UserProfile, ChecklistItem, MedicalChecklist } from '../types';

// ============================================
// TYPES
// ============================================

interface ApiCase {
  id: string;
  patientId: string;
  diagnosis: string;
  doctorNotes?: string;
  status: 'Draft' | 'Finalized';
  createdAt: string;
  updatedAt: string;
  checklistItems?: ApiChecklistItem[];
  images?: ApiCaseImage[];
  patient?: {
    id: string;
    name: string;
    hn: string;
  };
}

interface ApiChecklistItem {
  id: string;
  category: string;
  label: string;
  isObserved: boolean;
  isVerified: boolean;
}

interface ApiCaseImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  imageType: string;
  eyeSide: string;
  description?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Convert API case to frontend PatientCase type
function mapApiCaseToPatientCase(apiCase: ApiCase): PatientCase {
  // Build checklist
  const checklist: MedicalChecklist = {
    title: 'Slit Lamp Exam',
    items: (apiCase.checklistItems || []).map(item => ({
      id: item.id,
      category: item.category,
      label: item.label,
      isObserved: item.isObserved,
      isVerified: item.isVerified,
    })),
  };

  // Get primary image URL
  const primaryImage = apiCase.images?.[0];
  const imageUrl = primaryImage?.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';

  return {
    id: apiCase.id,
    hn: apiCase.patient?.hn || 'N/A',
    patientName: apiCase.patient?.name || 'Unknown',
    date: new Date(apiCase.createdAt),
    imageUrl,
    aiAnalysisText: apiCase.doctorNotes || '',
    checklist,
    diagnosis: apiCase.diagnosis || 'Pending',
    leftEye: { visualAcuity: '-', intraocularPressure: '-', diagnosis: '-', note: '' },
    rightEye: { visualAcuity: '-', intraocularPressure: '-', diagnosis: '-', note: '' },
    status: apiCase.status,
  };
}

// ============================================
// useProfile Hook
// ============================================

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { currentUser, loadProfile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  return {
    profile: currentUser,
    isLoading: authLoading || isLoading,
    error,
    refetch,
  };
}

// ============================================
// useCases Hook
// ============================================

interface UseCasesResult {
  cases: PatientCase[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useCases(): UseCasesResult {
  const { token, isAuthenticated } = useAuth();
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getCases(token);
      const mappedCases = (response.cases || []).map(mapApiCaseToPatientCase);
      setCases(mappedCases);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load records';
      setError(message);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch on mount when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCases();
    }
  }, [isAuthenticated, token, fetchCases]);

  return {
    cases,
    isLoading,
    error,
    isEmpty: !isLoading && cases.length === 0,
    refetch: fetchCases,
  };
}

// ============================================
// useCaseDetail Hook
// ============================================

interface UseCaseDetailResult {
  caseData: PatientCase | null;
  isLoading: boolean;
  error: string | null;
  isUnauthorized: boolean;
  refetch: () => Promise<void>;
}

export function useCaseDetail(caseId: string | null): UseCaseDetailResult {
  const { token } = useAuth();
  const [caseData, setCaseData] = useState<PatientCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const fetchCase = useCallback(async () => {
    if (!token || !caseId) {
      setCaseData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await apiService.getCaseById(caseId, token);
      if (response.case) {
        setCaseData(mapApiCaseToPatientCase(response.case));
      } else {
        setError('Case not found');
        setCaseData(null);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setIsUnauthorized(true);
          setError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (Unauthorized access)');
        } else if (err.status === 404) {
          setError('ไม่พบข้อมูลที่ต้องการ (Record not found)');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load case details');
      }
      setCaseData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, caseId]);

  // Fetch when caseId changes
  useEffect(() => {
    if (caseId) {
      fetchCase();
    } else {
      setCaseData(null);
      setError(null);
      setIsUnauthorized(false);
    }
  }, [caseId, fetchCase]);

  return {
    caseData,
    isLoading,
    error,
    isUnauthorized,
    refetch: fetchCase,
  };
}

// ============================================
// useMedications Hook
// ============================================

export interface Medication {
  id: string;
  medicineName: string;
  type: 'drop' | 'pill' | 'other';
  dosage?: string;
  frequency: string;
  nextTime: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  lastTakenAt?: string | null;
  totalLogs?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MedicationAdherence {
  rate: number;
  totalScheduled: number;
  totalTaken: number;
  periodDays: number;
}

interface UseMedicationsResult {
  medications: Medication[];
  adherence: MedicationAdherence | null;
  isLoading: boolean;
  isLogging: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
  logMedicationTaken: (id: string, notes?: string) => Promise<boolean>;
  createMedication: (data: {
    medicineName: string;
    type?: 'drop' | 'pill' | 'other';
    frequency?: string;
    nextTime: string;
    dosage?: string;
  }) => Promise<boolean>;
  deleteMedication: (id: string) => Promise<boolean>;
}

export function useMedications(): UseMedicationsResult {
  const { token, isAuthenticated } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState<MedicationAdherence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch medications with status and adherence in parallel
      const [medsResponse, adherenceResponse] = await Promise.all([
        apiService.getMedicationsWithStatus(token),
        apiService.getMedicationAdherence(7, token) // Last 7 days
      ]);
      
      setMedications(medsResponse.medications || []);
      setAdherence(adherenceResponse.adherence || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load medications');
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const logMedicationTaken = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    if (!token) return false;

    setIsLogging(true);
    setError(null);

    try {
      await apiService.logMedicationTaken(id, { notes }, token);
      // Refresh medications list to update lastTakenAt
      await fetchMedications();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log medication');
      return false;
    } finally {
      setIsLogging(false);
    }
  }, [token, fetchMedications]);

  const createMedication = useCallback(async (data: {
    medicineName: string;
    type?: 'drop' | 'pill' | 'other';
    frequency?: string;
    nextTime: string;
    dosage?: string;
  }): Promise<boolean> => {
    if (!token) return false;

    setIsLoading(true);
    setError(null);

    try {
      await apiService.createMedication(data, token);
      await fetchMedications();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create medication');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchMedications]);

  const deleteMedication = useCallback(async (id: string): Promise<boolean> => {
    if (!token) return false;

    try {
      await apiService.deleteMedication(id, token);
      await fetchMedications();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete medication');
      return false;
    }
  }, [token, fetchMedications]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMedications();
    }
  }, [isAuthenticated, token, fetchMedications]);

  return {
    medications,
    adherence,
    isLoading,
    isLogging,
    error,
    isEmpty: !isLoading && medications.length === 0,
    refetch: fetchMedications,
    logMedicationTaken,
    createMedication,
    deleteMedication,
  };
}

// ============================================
// useVisionTests Hook
// ============================================

interface VisionTest {
  id: string;
  testType: string;
  result: string;
  details?: string;
  score?: number;
  createdAt: string;
}

interface UseVisionTestsResult {
  tests: VisionTest[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
  saveTest: (data: { testType: string; result: string; details?: string; score?: number }) => Promise<boolean>;
}

export function useVisionTests(): UseVisionTestsResult {
  const { token, isAuthenticated } = useAuth();
  const [tests, setTests] = useState<VisionTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getVisionTests(token);
      setTests(response.tests || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load vision tests');
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const saveTest = useCallback(async (data: { testType: string; result: string; details?: string; score?: number }): Promise<boolean> => {
    if (!token) return false;

    try {
      await apiService.createVisionTest(data, token);
      await fetchTests();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save test');
      return false;
    }
  }, [token, fetchTests]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTests();
    }
  }, [isAuthenticated, token, fetchTests]);

  return {
    tests,
    isLoading,
    error,
    isEmpty: !isLoading && tests.length === 0,
    refetch: fetchTests,
    saveTest,
  };
}

// ============================================
// useArticles Hook
// ============================================

interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  imageUrl?: string;
  readTimeMinutes?: number;
  viewCount?: number;
  isPublished: boolean;
  createdAt: string;
}

interface UseArticlesResult {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: (category?: string) => Promise<void>;
}

export function useArticles(initialCategory?: string): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (category?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getArticles(category);
      setArticles(response.articles || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(initialCategory);
  }, [initialCategory, fetchArticles]);

  return {
    articles,
    isLoading,
    error,
    isEmpty: !isLoading && articles.length === 0,
    refetch: fetchArticles,
  };
}

export default {
  useProfile,
  useCases,
  useCaseDetail,
  useMedications,
  useVisionTests,
  useArticles,
};

