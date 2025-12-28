/**
 * Mock Patient Cases Data
 * ข้อมูลประวัติการรักษาแบบ Mock สำหรับ Frontend Standalone
 */

import { PatientCase, MedicalChecklist } from '../types';

// Helper function to create date
function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

// Mock checklist items
const createChecklist = (items: Array<{ category: string; label: string; isObserved: boolean; isVerified: boolean }>): MedicalChecklist => ({
  title: 'Slit Lamp Examination',
  items: items.map((item, index) => ({
    id: `checklist-${index}`,
    category: item.category,
    label: item.label,
    isObserved: item.isObserved,
    isVerified: item.isVerified,
  })),
});

// Mock Cases Data
export const MOCK_PATIENT_CASES: PatientCase[] = [
  {
    id: 'case-001',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 12, 15),
    imageUrl: 'https://picsum.photos/800/600?random=1',
    aiAnalysisText: 'พบความผิดปกติเล็กน้อยที่บริเวณ macula ของตาขวา แนะนำให้ติดตามอาการอย่างใกล้ชิด และมาตรวจซ้ำในอีก 3 เดือน',
    checklist: createChecklist([
      { category: 'Cornea', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Anterior Chamber', label: 'Deep and quiet', isObserved: true, isVerified: true },
      { category: 'Iris', label: 'Normal', isObserved: true, isVerified: true },
      { category: 'Lens', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Vitreous', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Retina', label: 'Mild macular changes', isObserved: true, isVerified: true },
    ]),
    diagnosis: 'Mild Macular Degeneration (Early Stage)',
    leftEye: {
      visualAcuity: '20/25',
      intraocularPressure: '14 mmHg',
      diagnosis: 'Normal',
      note: 'ไม่มีอาการผิดปกติ',
    },
    rightEye: {
      visualAcuity: '20/30',
      intraocularPressure: '15 mmHg',
      diagnosis: 'Mild Macular Changes',
      note: 'พบความเปลี่ยนแปลงเล็กน้อยที่ macula',
    },
    status: 'Finalized',
  },
  {
    id: 'case-002',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 11, 20),
    imageUrl: 'https://picsum.photos/800/600?random=2',
    aiAnalysisText: 'ผลการตรวจพบว่าตาขวามีอาการดีขึ้นเมื่อเทียบกับการตรวจครั้งก่อน แนะนำให้ใช้ยาตามที่แพทย์สั่งอย่างสม่ำเสมอ',
    checklist: createChecklist([
      { category: 'Cornea', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Anterior Chamber', label: 'Deep and quiet', isObserved: true, isVerified: true },
      { category: 'Iris', label: 'Normal', isObserved: true, isVerified: true },
      { category: 'Lens', label: 'Mild cataract', isObserved: true, isVerified: true },
      { category: 'Vitreous', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Retina', label: 'Stable', isObserved: true, isVerified: true },
    ]),
    diagnosis: 'Cataract (Early Stage) - Right Eye',
    leftEye: {
      visualAcuity: '20/20',
      intraocularPressure: '13 mmHg',
      diagnosis: 'Normal',
      note: 'ไม่มีอาการผิดปกติ',
    },
    rightEye: {
      visualAcuity: '20/25',
      intraocularPressure: '14 mmHg',
      diagnosis: 'Early Cataract',
      note: 'พบต้อกระจกระยะเริ่มต้น',
    },
    status: 'Finalized',
  },
  {
    id: 'case-003',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 10, 5),
    imageUrl: 'https://picsum.photos/800/600?random=3',
    aiAnalysisText: 'การตรวจครั้งนี้เป็นการตรวจสุขภาพตาเบื้องต้น พบว่าสุขภาพตาทั้งสองข้างอยู่ในเกณฑ์ปกติ แนะนำให้มาตรวจซ้ำทุก 6 เดือน',
    checklist: createChecklist([
      { category: 'Cornea', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Anterior Chamber', label: 'Deep and quiet', isObserved: true, isVerified: true },
      { category: 'Iris', label: 'Normal', isObserved: true, isVerified: true },
      { category: 'Lens', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Vitreous', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Retina', label: 'Normal', isObserved: true, isVerified: true },
    ]),
    diagnosis: 'Normal Eye Examination',
    leftEye: {
      visualAcuity: '20/20',
      intraocularPressure: '12 mmHg',
      diagnosis: 'Normal',
      note: 'สุขภาพตาปกติ',
    },
    rightEye: {
      visualAcuity: '20/20',
      intraocularPressure: '13 mmHg',
      diagnosis: 'Normal',
      note: 'สุขภาพตาปกติ',
    },
    status: 'Finalized',
  },
  {
    id: 'case-004',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 9, 12),
    imageUrl: 'https://picsum.photos/800/600?random=4',
    aiAnalysisText: 'ผู้ป่วยมาด้วยอาการตาแห้งและระคายเคือง ตรวจพบว่ามีอาการตาแห้งเล็กน้อย แนะนำให้ใช้น้ำตาเทียมและหลีกเลี่ยงการจ้องหน้าจอเป็นเวลานาน',
    checklist: createChecklist([
      { category: 'Cornea', label: 'Mild dryness', isObserved: true, isVerified: true },
      { category: 'Anterior Chamber', label: 'Deep and quiet', isObserved: true, isVerified: true },
      { category: 'Iris', label: 'Normal', isObserved: true, isVerified: true },
      { category: 'Lens', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Vitreous', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Retina', label: 'Normal', isObserved: true, isVerified: true },
    ]),
    diagnosis: 'Dry Eye Syndrome',
    leftEye: {
      visualAcuity: '20/25',
      intraocularPressure: '14 mmHg',
      diagnosis: 'Dry Eye',
      note: 'มีอาการตาแห้งเล็กน้อย',
    },
    rightEye: {
      visualAcuity: '20/25',
      intraocularPressure: '15 mmHg',
      diagnosis: 'Dry Eye',
      note: 'มีอาการตาแห้งเล็กน้อย',
    },
    status: 'Finalized',
  },
  {
    id: 'case-005',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 8, 18),
    imageUrl: 'https://picsum.photos/800/600?random=5',
    aiAnalysisText: 'การตรวจพบว่าตาขวามีอาการดีขึ้นมากหลังจากใช้ยาตามที่แพทย์สั่ง แนะนำให้ติดตามอาการต่อเนื่อง',
    checklist: createChecklist([
      { category: 'Cornea', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Anterior Chamber', label: 'Deep and quiet', isObserved: true, isVerified: true },
      { category: 'Iris', label: 'Normal', isObserved: true, isVerified: true },
      { category: 'Lens', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Vitreous', label: 'Clear', isObserved: true, isVerified: true },
      { category: 'Retina', label: 'Improving', isObserved: true, isVerified: true },
    ]),
    diagnosis: 'Follow-up: Macular Degeneration',
    leftEye: {
      visualAcuity: '20/20',
      intraocularPressure: '13 mmHg',
      diagnosis: 'Normal',
      note: 'ไม่มีอาการผิดปกติ',
    },
    rightEye: {
      visualAcuity: '20/28',
      intraocularPressure: '14 mmHg',
      diagnosis: 'Improving',
      note: 'อาการดีขึ้นเมื่อเทียบกับครั้งก่อน',
    },
    status: 'Finalized',
  },
];

/**
 * Get mock cases for a specific patient (by HN)
 * In mock mode, always return all cases regardless of HN
 */
export function getMockCasesByHN(hn: string): PatientCase[] {
  // In mock mode, return all cases (we'll update HN later)
  return MOCK_PATIENT_CASES.map(case_ => ({ ...case_ }));
}

/**
 * Get mock case by ID
 */
export function getMockCaseById(caseId: string): PatientCase | undefined {
  return MOCK_PATIENT_CASES.find(case_ => case_.id === caseId);
}

