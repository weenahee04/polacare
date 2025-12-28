/**
 * Test Data Seeding Script
 * 
 * Creates test data for CI/CD pipelines and E2E testing
 * 
 * Usage: npx tsx tests/seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test user credentials (predictable for E2E tests)
export const TEST_USERS = {
  patient: {
    phoneNumber: '+66811111111',
    password: 'TestPatient123!',
    name: 'Test Patient',
    hn: 'HN-TEST-001',
    gender: 'Male' as const,
    dateOfBirth: new Date('1990-05-15'),
    weight: 70,
    height: 175,
    bmi: 22.86,
  },
  doctor: {
    phoneNumber: '+66822222222',
    password: 'TestDoctor123!',
    name: 'Dr. Test Doctor',
    hn: 'HN-DOC-001',
    gender: 'Female' as const,
    dateOfBirth: new Date('1985-03-20'),
    weight: 55,
    height: 165,
    bmi: 20.20,
    role: 'doctor' as const,
    licenseNumber: 'DOC-12345',
    specialization: 'Ophthalmology',
    department: 'Eye Care',
  },
  admin: {
    phoneNumber: '+66833333333',
    password: 'TestAdmin123!',
    name: 'Test Admin',
    hn: 'HN-ADMIN-001',
    gender: 'Other' as const,
    dateOfBirth: new Date('1988-07-10'),
    weight: 65,
    height: 170,
    bmi: 22.49,
    role: 'admin' as const,
  },
};

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  try {
    // Clear existing test data
    console.log('Cleaning up existing test data...');
    await cleanupTestData();

    // Create test users
    console.log('\n📝 Creating test users...');
    const users = await createTestUsers();

    // Create test medications
    console.log('\n💊 Creating test medications...');
    await createTestMedications(users.patient.id);

    // Create test cases
    console.log('\n📋 Creating test cases...');
    await createTestCases(users.patient.id, users.doctor.id);

    // Create test articles
    console.log('\n📰 Creating test articles...');
    await createTestArticles(users.admin.id);

    console.log('\n✅ Test data seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('================');
    console.log(`Patient: ${TEST_USERS.patient.phoneNumber} / ${TEST_USERS.patient.password}`);
    console.log(`Doctor:  ${TEST_USERS.doctor.phoneNumber} / ${TEST_USERS.doctor.password}`);
    console.log(`Admin:   ${TEST_USERS.admin.phoneNumber} / ${TEST_USERS.admin.password}`);

    return users;
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

async function cleanupTestData() {
  // Delete in order of dependencies
  const testPhones = Object.values(TEST_USERS).map(u => u.phoneNumber);
  
  // Find test users
  const testUsers = await prisma.user.findMany({
    where: { phoneNumber: { in: testPhones } },
    select: { id: true }
  });
  
  const testUserIds = testUsers.map(u => u.id);
  
  if (testUserIds.length > 0) {
    // Delete related data
    await prisma.medicationLog.deleteMany({ where: { patientId: { in: testUserIds } } });
    await prisma.medication.deleteMany({ where: { patientId: { in: testUserIds } } });
    await prisma.visionTestResult.deleteMany({ where: { patientId: { in: testUserIds } } });
    await prisma.checklistItem.deleteMany({ 
      where: { case: { patientId: { in: testUserIds } } } 
    });
    await prisma.caseImage.deleteMany({ 
      where: { case: { patientId: { in: testUserIds } } } 
    });
    await prisma.patientCase.deleteMany({ where: { patientId: { in: testUserIds } } });
    await prisma.consent.deleteMany({ where: { userId: { in: testUserIds } } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: testUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
  }
}

async function createTestUsers() {
  const hashedPatientPw = await bcrypt.hash(TEST_USERS.patient.password, 10);
  const hashedDoctorPw = await bcrypt.hash(TEST_USERS.doctor.password, 10);
  const hashedAdminPw = await bcrypt.hash(TEST_USERS.admin.password, 10);

  const patient = await prisma.user.create({
    data: {
      ...TEST_USERS.patient,
      password: hashedPatientPw,
      role: 'patient',
      isVerified: true,
      isActive: true,
    }
  });
  console.log(`  ✓ Created patient: ${patient.name} (${patient.hn})`);

  const doctor = await prisma.user.create({
    data: {
      ...TEST_USERS.doctor,
      password: hashedDoctorPw,
      isVerified: true,
      isActive: true,
    }
  });
  console.log(`  ✓ Created doctor: ${doctor.name} (${doctor.hn})`);

  const admin = await prisma.user.create({
    data: {
      ...TEST_USERS.admin,
      password: hashedAdminPw,
      isVerified: true,
      isActive: true,
    }
  });
  console.log(`  ✓ Created admin: ${admin.name} (${admin.hn})`);

  return { patient, doctor, admin };
}

async function createTestMedications(patientId: string) {
  const medications = [
    {
      patientId,
      medicineName: 'Tears Naturale (Test)',
      type: 'drop' as const,
      frequency: '4 times/day',
      nextTime: '08:00',
      dosage: '1-2 drops',
      isActive: true,
    },
    {
      patientId,
      medicineName: 'Vigamox (Test)',
      type: 'drop' as const,
      frequency: '2 times/day',
      nextTime: '09:00',
      dosage: '1 drop',
      isActive: true,
    },
  ];

  for (const med of medications) {
    const created = await prisma.medication.create({ data: med });
    console.log(`  ✓ Created medication: ${created.medicineName}`);

    // Add some logs
    await prisma.medicationLog.create({
      data: {
        medicationId: created.id,
        patientId,
        scheduledTime: new Date(),
        takenAt: new Date(),
        taken: true,
        notes: 'Test log',
      }
    });
  }
}

async function createTestCases(patientId: string, doctorId: string) {
  const cases = [
    {
      patientId,
      createdById: doctorId,
      hn: 'HN-TEST-001',
      patientName: 'Test Patient',
      date: new Date(),
      diagnosis: 'Dry Eye Syndrome (Test)',
      doctorNotes: 'Patient reports occasional dryness. Recommended artificial tears.',
      status: 'Finalized' as const,
      leftEyeVisualAcuity: '20/20',
      leftEyeIntraocularPressure: '14 mmHg',
      rightEyeVisualAcuity: '20/25',
      rightEyeIntraocularPressure: '15 mmHg',
    },
    {
      patientId,
      createdById: doctorId,
      hn: 'HN-TEST-001',
      patientName: 'Test Patient',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      diagnosis: 'Annual Check-up (Test)',
      doctorNotes: 'Regular annual eye examination. No issues found.',
      status: 'Finalized' as const,
      leftEyeVisualAcuity: '20/20',
      leftEyeIntraocularPressure: '13 mmHg',
      rightEyeVisualAcuity: '20/20',
      rightEyeIntraocularPressure: '14 mmHg',
    },
  ];

  for (const caseData of cases) {
    const created = await prisma.patientCase.create({
      data: {
        ...caseData,
        checklistItems: {
          create: [
            { category: 'Lids/Lashes', label: 'Normal appearance', isObserved: true, isVerified: true },
            { category: 'Cornea', label: 'Clear', isObserved: true, isVerified: true },
            { category: 'Pupil', label: 'Reactive', isObserved: true, isVerified: true },
          ]
        }
      }
    });
    console.log(`  ✓ Created case: ${created.diagnosis} (${created.id.slice(0, 8)}...)`);
  }
}

async function createTestArticles(authorId: string) {
  const articles = [
    {
      title: 'Test Article: Eye Care Basics',
      content: 'This is a test article about basic eye care practices.',
      category: 'Eye Care',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
      readTime: '3 min',
      isPublished: true,
      authorId,
    },
    {
      title: 'Test Article: Managing Dry Eyes',
      content: 'This is a test article about managing dry eye symptoms.',
      category: 'Eye Care',
      imageUrl: 'https://images.unsplash.com/photo-1579684385136-4f8995f52a76',
      readTime: '5 min',
      isPublished: true,
      authorId,
    },
  ];

  for (const article of articles) {
    const created = await prisma.article.create({ data: article });
    console.log(`  ✓ Created article: ${created.title}`);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export { seedTestData, cleanupTestData };

