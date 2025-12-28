// API Request/Response Types
// Auto-generated types should be used from Prisma, but these are for API contracts

import { UserRole, Gender, CaseStatus, MedicationType, VisionTestType, ConsentType, AuditAction } from '@prisma/client';

// ============================================
// AUTHENTICATION
// ============================================

export interface RequestOTPRequest {
  phoneNumber: string;
}

export interface RequestOTPResponse {
  message: string;
  phoneNumber: string;
  expiresIn: number; // seconds
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: UserResponse;
  expiresIn: number; // seconds
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  name: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string
  weight: number;
  height: number;
  avatarUrl?: string;
}

export interface RegisterResponse {
  user: UserResponse;
  token: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// ============================================
// USER & PROFILE
// ============================================

export interface UserResponse {
  id: string;
  phoneNumber: string;
  name: string;
  hn: string;
  avatarUrl?: string | null;
  gender: Gender;
  dateOfBirth: string;
  weight: number;
  height: number;
  bmi: number;
  role: UserRole;
  isVerified: boolean;
  profile?: PatientProfileResponse;
}

export interface PatientProfileResponse {
  id: string;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  address?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  gender?: Gender;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  avatarUrl?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
}

// ============================================
// PATIENT CASES
// ============================================

export interface PatientCaseResponse {
  id: string;
  patientId: string;
  hn: string;
  patientName: string;
  date: string;
  diagnosis: string;
  aiAnalysisText?: string | null;
  doctorNotes?: string | null;
  status: CaseStatus;
  leftEye?: EyeData;
  rightEye?: EyeData;
  images: CaseImageResponse[];
  checklistItems: ChecklistItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface EyeData {
  visualAcuity?: string | null;
  intraocularPressure?: string | null;
  diagnosis?: string | null;
  note?: string | null;
}

export interface CaseImageResponse {
  id: string;
  imageUrl: string;
  storageType: string;
  imageType: string;
  description?: string | null;
  order: number;
}

export interface ChecklistItemResponse {
  id: string;
  category: string;
  label: string;
  isObserved: boolean;
  isVerified: boolean;
}

export interface CreateCaseRequest {
  patientId: string;
  hn: string;
  patientName: string;
  date: string;
  diagnosis: string;
  aiAnalysisText?: string;
  doctorNotes?: string;
  leftEye?: EyeData;
  rightEye?: EyeData;
  images?: CreateCaseImageRequest[];
  checklistItems?: CreateChecklistItemRequest[];
  status?: CaseStatus;
}

export interface CreateCaseImageRequest {
  imageUrl: string;
  imageType: string;
  description?: string;
  order?: number;
}

export interface CreateChecklistItemRequest {
  category: string;
  label: string;
  isObserved?: boolean;
  isVerified?: boolean;
}

export interface CasesListResponse {
  cases: PatientCaseResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// MEDICATIONS
// ============================================

export interface MedicationResponse {
  id: string;
  patientId: string;
  medicineName: string;
  type: MedicationType;
  frequency: string;
  nextTime: string;
  dosage?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  adherenceRate?: number; // calculated
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationRequest {
  medicineName: string;
  type: MedicationType;
  frequency: string;
  nextTime: string;
  dosage?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMedicationRequest {
  medicineName?: string;
  type?: MedicationType;
  frequency?: string;
  nextTime?: string;
  dosage?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface MedicationsListResponse {
  medications: MedicationResponse[];
  total: number;
}

// ============================================
// MEDICATION LOGS
// ============================================

export interface MedicationLogResponse {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  takenAt?: string | null;
  taken: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CreateMedicationLogRequest {
  medicationId: string;
  scheduledTime: string;
  taken: boolean;
  notes?: string;
}

export interface MedicationLogsListResponse {
  logs: MedicationLogResponse[];
  total: number;
  adherenceRate: number;
}

// ============================================
// VISION TESTS
// ============================================

export interface VisionTestResultResponse {
  id: string;
  patientId: string;
  testName: string;
  testType: VisionTestType;
  result: string;
  details?: string | null;
  testDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisionTestRequest {
  testName: string;
  testType: VisionTestType;
  result: string;
  details?: string;
  testDate?: string;
}

export interface VisionTestsListResponse {
  tests: VisionTestResultResponse[];
  total: number;
}

// ============================================
// ARTICLES
// ============================================

export interface ArticleResponse {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  content: string;
  excerpt?: string | null;
  readTime: string;
  publishedAt: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  title: string;
  category: string;
  imageUrl: string;
  content: string;
  excerpt?: string;
  readTime: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  category?: string;
  imageUrl?: string;
  content?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export interface ArticlesListResponse {
  articles: ArticleResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// CONSENT & PDPA
// ============================================

export interface ConsentResponse {
  id: string;
  userId: string;
  termsVersion: string;
  consentType: ConsentType;
  accepted: boolean;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface CreateConsentRequest {
  termsVersion: string;
  consentType: ConsentType;
  accepted: boolean;
}

export interface TermsVersionResponse {
  id: string;
  version: string;
  content: string;
  effectiveDate: string;
  isActive: boolean;
}

// ============================================
// AUDIT LOGS
// ============================================

export interface AuditLogResponse {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AuditLogsListResponse {
  logs: AuditLogResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// COMMON
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  requestId?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T = any> {
  data?: T;
  message?: string;
}

