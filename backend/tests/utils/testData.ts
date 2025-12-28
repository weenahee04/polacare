/**
 * Test Data Factory
 * 
 * Generates test data for various entities
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================
// USER DATA
// ============================================

export interface TestUser {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  weight: number;
  height: number;
}

let userCounter = 0;

export function generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
  userCounter++;
  const suffix = Date.now().toString().slice(-6) + userCounter;
  
  return {
    phoneNumber: `09${suffix.padStart(8, '0').slice(0, 8)}`,
    password: 'TestPassword123!',
    firstName: `TestUser${suffix}`,
    lastName: 'Tester',
    gender: 'Male',
    dateOfBirth: '1990-01-15',
    weight: 70,
    height: 175,
    ...overrides,
  };
}

export function generateStaffUser(role: 'doctor' | 'admin'): TestUser & { role: string } {
  const user = generateTestUser({
    firstName: role === 'doctor' ? 'Dr. Test' : 'Admin Test',
    lastName: role === 'doctor' ? 'Doctor' : 'Admin',
  });
  return { ...user, role };
}

// ============================================
// MEDICATION DATA
// ============================================

export interface TestMedication {
  medicineName: string;
  type: 'drop' | 'pill' | 'other';
  frequency: string;
  nextTime: string;
  dosage?: string;
}

const medicationNames = [
  'Tears Naturale',
  'Vigamox',
  'Pred Forte',
  'Cosopt',
  'Lumigan',
  'Xalatan',
];

export function generateTestMedication(overrides: Partial<TestMedication> = {}): TestMedication {
  const name = medicationNames[Math.floor(Math.random() * medicationNames.length)];
  
  return {
    medicineName: name,
    type: Math.random() > 0.3 ? 'drop' : 'pill',
    frequency: '4 times/day',
    nextTime: '08:00',
    dosage: '1 drop',
    ...overrides,
  };
}

// ============================================
// CASE DATA
// ============================================

export interface TestCase {
  patientId: string;
  diagnosis: string;
  doctorNotes?: string;
  leftEye?: {
    visualAcuity: string;
    intraocularPressure: string;
    diagnosis?: string;
  };
  rightEye?: {
    visualAcuity: string;
    intraocularPressure: string;
    diagnosis?: string;
  };
}

const diagnoses = [
  'Dry Eye Syndrome',
  'Conjunctivitis',
  'Glaucoma',
  'Cataract',
  'Myopia',
  'Hyperopia',
];

export function generateTestCase(patientId: string, overrides: Partial<TestCase> = {}): TestCase {
  return {
    patientId,
    diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
    doctorNotes: 'Test case notes for automated testing',
    leftEye: {
      visualAcuity: '20/20',
      intraocularPressure: '15 mmHg',
      diagnosis: 'Normal',
    },
    rightEye: {
      visualAcuity: '20/25',
      intraocularPressure: '16 mmHg',
      diagnosis: 'Normal',
    },
    ...overrides,
  };
}

// ============================================
// VISION TEST DATA
// ============================================

export interface TestVisionTest {
  testName: string;
  testType: string;
  result: 'Normal' | 'Abnormal';
  details?: string;
}

export function generateTestVisionTest(overrides: Partial<TestVisionTest> = {}): TestVisionTest {
  return {
    testName: 'Amsler Grid Test',
    testType: 'AmslerGrid',
    result: 'Normal',
    details: 'No distortion detected in test grid',
    ...overrides,
  };
}

// ============================================
// CONSENT DATA
// ============================================

export interface TestConsent {
  consentType: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

export function generateTestConsent(overrides: Partial<TestConsent> = {}): TestConsent {
  return {
    consentType: 'TERMS_OF_SERVICE',
    version: '1.0',
    ipAddress: '127.0.0.1',
    userAgent: 'Test/1.0',
    ...overrides,
  };
}

// ============================================
// HELPERS
// ============================================

export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function randomPhone(): string {
  return `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

export function randomEmail(): string {
  return `test${randomString(8)}@example.com`;
}

export function formatThaiPhone(phone: string): string {
  if (phone.startsWith('0')) {
    return '+66' + phone.slice(1);
  }
  if (phone.startsWith('+66')) {
    return phone;
  }
  return '+66' + phone;
}

