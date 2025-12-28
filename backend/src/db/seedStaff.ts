/**
 * Seed Staff Accounts
 * 
 * Creates initial doctor and admin accounts for testing.
 */

import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

const staffAccounts = [
  {
    phoneNumber: '0800000001',
    password: 'doctor123',
    name: 'Dr. สมชาย แพทย์ดี',
    hn: 'STAFF-001',
    gender: 'Male',
    dateOfBirth: new Date('1980-01-15'),
    weight: 70,
    height: 175,
    role: 'doctor',
    licenseNumber: 'DOC-12345',
    specialization: 'Ophthalmology',
    department: 'Eye Care Center'
  },
  {
    phoneNumber: '0800000002',
    password: 'admin123',
    name: 'Admin ผู้ดูแลระบบ',
    hn: 'STAFF-002',
    gender: 'Female',
    dateOfBirth: new Date('1985-06-20'),
    weight: 55,
    height: 160,
    role: 'admin',
    department: 'Administration'
  },
  {
    phoneNumber: '0800000003',
    password: 'doctor456',
    name: 'Dr. วิชัย จักษุแพทย์',
    hn: 'STAFF-003',
    gender: 'Male',
    dateOfBirth: new Date('1975-03-10'),
    weight: 75,
    height: 178,
    role: 'doctor',
    licenseNumber: 'DOC-67890',
    specialization: 'Glaucoma Specialist',
    department: 'Eye Care Center'
  }
];

async function seedStaff() {
  console.log('🌱 Seeding staff accounts...');

  for (const staff of staffAccounts) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: staff.phoneNumber },
          { hn: staff.hn }
        ]
      }
    });

    if (existing) {
      console.log(`  ⏭️  Skipping ${staff.name} (already exists)`);
      continue;
    }

    const heightM = staff.height / 100;
    const bmi = staff.weight / (heightM * heightM);

    await prisma.user.create({
      data: {
        phoneNumber: staff.phoneNumber,
        password: await bcrypt.hash(staff.password, 10),
        name: staff.name,
        hn: staff.hn,
        gender: staff.gender as any,
        dateOfBirth: staff.dateOfBirth,
        weight: staff.weight,
        height: staff.height,
        bmi: parseFloat(bmi.toFixed(2)),
        role: staff.role as any,
        isVerified: true,
        isActive: true,
        licenseNumber: staff.licenseNumber,
        specialization: staff.specialization,
        department: staff.department
      }
    });

    console.log(`  ✅ Created ${staff.role}: ${staff.name}`);
  }

  console.log('✅ Staff seeding complete!');
  console.log('');
  console.log('Staff Credentials:');
  console.log('==================');
  staffAccounts.forEach(s => {
    console.log(`${s.role}: ${s.phoneNumber} / ${s.password}`);
  });
}

seedStaff()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

