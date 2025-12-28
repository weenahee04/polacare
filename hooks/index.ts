/**
 * Hooks Index
 * 
 * Export all custom hooks for easy imports
 */

// Auth hooks
export { useAuth } from '../contexts/AuthContext.mock';

// API hooks
export { useApi, useCases as useApiCases, useMedications as useApiMedications, useVisionTests as useApiVisionTests, useArticles as useApiArticles } from './useApi';

// Patient data hooks
export { 
  useProfile, 
  useCases, 
  useCaseDetail, 
  useMedications, 
  useVisionTests,
  useArticles,
} from './usePatientData';

// Types from patient data hooks
export type { Medication } from './usePatientData';

// Protected route hook
export { useRequireAuth } from './useRequireAuth';

