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
// TODO: แทนที่ imageUrl ด้วย URL รูป Slit Lamp จริงที่อัปโหลดแล้ว
// ดูคำแนะนำใน data/IMAGE_SETUP_GUIDE.md
export const MOCK_PATIENT_CASES: PatientCase[] = [
  {
    id: 'case-001',
    hn: 'HN-123456',
    patientName: 'คุณสมชาย ใจดี',
    date: createDate(2024, 12, 15),
    imageUrl: 'https://media.discordapp.net/attachments/865267722606870600/1454967275919773992/images_2.jfif?ex=6953035e&is=6951b1de&hm=a3313a55ae9de36b8d3d5550bc221661b5d6fb57000db12361fa44dc79d90804&=&format=webp&width=800&height=600',
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
    imageUrl: 'https://media.discordapp.net/attachments/865267722606870600/1454967433843703919/m-img-ca1df370637de0c95f799368a0cde293.jpg?ex=69530384&is=6951b204&hm=2c87bf9c33d7339c57da65df0b735b5c301029eda3a3521e2c6fb4d93eb81981&=&format=webp&width=900&height=600',
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
    imageUrl: 'https://media.discordapp.net/attachments/865267722606870600/1454967445847539823/180829_0003.jpg?ex=69530387&is=6951b207&hm=9e5895bc61f0fecbbb9f8a89d3ea82476caeaae08a1c92a1775f7ac7337fdaa1&=&format=webp&width=800&height=600',
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
    imageUrl: 'https://media.discordapp.net/attachments/865267722606870600/1454967458552348714/blurred-vision-1.jpg.xl.webp?ex=6953038a&is=6951b20a&hm=b7d01fdd5a677f5f0bde8008743f0a5372e0b3951895b9d724d29e8efbd96c3d&=&format=webp&width=800&height=600',
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
    imageUrl: 'https://media.discordapp.net/attachments/865267722606870600/1454967468706631894/images_1.jfif?ex=6953038c&is=6951b20c&hm=ca64f03e56c6e0d992f4879dbd195387ba30aa55e9efbb18b538fa3fca89cc10&=&format=webp&width=800&height=600',
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

