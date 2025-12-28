import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected for seeding');

    // Clear existing data (order matters due to foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.medicationLog.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.caseImage.deleteMany();
    await prisma.patientCase.deleteMany();
    await prisma.medication.deleteMany();
    await prisma.visionTestResult.deleteMany();
    await prisma.consent.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.oTP.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();

    console.log('📝 Creating sample data...');

    // Create sample admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        phoneNumber: '+66800000001',
        password: adminPassword,
        name: 'Admin User',
        hn: 'ADMIN-001',
        gender: 'Other',
        dateOfBirth: new Date('1980-01-01'),
        weight: 70,
        height: 175,
        bmi: 22.9,
        role: 'admin',
        isVerified: true,
        isActive: true
      }
    });

    // Create sample doctor
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await prisma.user.create({
      data: {
        phoneNumber: '+66800000002',
        password: doctorPassword,
        name: 'Dr. Somchai Ophthalmologist',
        hn: 'DOC-001',
        gender: 'Male',
        dateOfBirth: new Date('1975-05-15'),
        weight: 75,
        height: 175,
        bmi: 24.5,
        role: 'doctor',
        isVerified: true,
        isActive: true,
        licenseNumber: 'MD-12345',
        specialization: 'Ophthalmology',
        department: 'Eye Clinic'
      }
    });

    // Create sample patient
    const hashedPassword = await bcrypt.hash('password123', 10);
    const patient = await prisma.user.create({
      data: {
        phoneNumber: '+66812345678',
        password: hashedPassword,
        name: 'Somsak Jaidee',
        hn: 'HN-660012',
        gender: 'Male',
        dateOfBirth: new Date('1980-01-01'),
        weight: 75,
        height: 175,
        bmi: 24.5,
        role: 'patient',
        isVerified: true,
        isActive: true
      }
    });

    // Create patient profile
    await prisma.patientProfile.create({
      data: {
        userId: patient.id,
        emergencyContact: 'นางสาวสมหญิง ใจดี',
        emergencyPhone: '+66812345679',
        address: '123 ถ.สุขุมวิท กรุงเทพฯ 10110',
        allergies: 'ไม่มี',
        medicalHistory: 'เบาหวาน ควบคุมได้'
      }
    });

    // Create sample case 1
    const case1 = await prisma.patientCase.create({
      data: {
        patientId: patient.id,
        hn: patient.hn,
        patientName: patient.name,
        date: new Date('2023-10-25'),
        aiAnalysisText: 'Infiltrate size 2mm at paracentral cornea. Anterior chamber has rare cells. Pupil reactive.',
        doctorNotes: 'Patient responded well to treatment. Follow-up in 1 week.',
        diagnosis: 'Bacterial Keratitis (OD)',
        status: 'Finalized',
        createdBy: doctor.id,
        leftEyeVisualAcuity: '20/40',
        leftEyeIntraocularPressure: '15 mmHg',
        leftEyeDiagnosis: 'Bacterial Keratitis',
        rightEyeVisualAcuity: '20/20',
        rightEyeIntraocularPressure: '14 mmHg',
        rightEyeDiagnosis: 'Normal',
        checklistItems: {
          create: [
            { category: 'Lids/Lashes', label: 'Normal limits', isObserved: false, isVerified: true },
            { category: 'Conjunctiva', label: 'Mild Injection (Redness)', isObserved: true, isVerified: true },
            { category: 'Cornea', label: 'Infiltrate (White Spot)', isObserved: true, isVerified: true },
            { category: 'Cornea', label: 'Epithelial Defect', isObserved: true, isVerified: true },
            { category: 'Ant. Chamber', label: 'Cell 1+', isObserved: true, isVerified: true },
            { category: 'Lens', label: 'Clear', isObserved: false, isVerified: true }
          ]
        }
      }
    });

    // Create sample case 2
    const case2 = await prisma.patientCase.create({
      data: {
        patientId: patient.id,
        hn: patient.hn,
        patientName: patient.name,
        date: new Date('2023-08-15'),
        aiAnalysisText: 'Routine examination. Early stage nuclear sclerosis cataract observed.',
        doctorNotes: 'Monitor progression. No immediate intervention needed.',
        diagnosis: 'Senile Cataract (Early)',
        status: 'Finalized',
        createdBy: doctor.id,
        checklistItems: {
          create: [
            { category: 'Lids/Lashes', label: 'Clear', isObserved: false, isVerified: true },
            { category: 'Cornea', label: 'Clear', isObserved: false, isVerified: true },
            { category: 'Ant. Chamber', label: 'Deep & Quiet', isObserved: false, isVerified: true },
            { category: 'Iris', label: 'Normal Pattern', isObserved: false, isVerified: true },
            { category: 'Lens', label: 'Mild NS (Cataract)', isObserved: true, isVerified: true }
          ]
        }
      }
    });

    // Create sample medications
    const med1 = await prisma.medication.create({
      data: {
        patientId: patient.id,
        medicineName: 'Hialid (Tears)',
        frequency: '4 times/day',
        nextTime: '13:00',
        type: 'drop',
        dosage: '1 drop',
        isActive: true
      }
    });

    const med2 = await prisma.medication.create({
      data: {
        patientId: patient.id,
        medicineName: 'Vigamox',
        frequency: '2 times/day',
        nextTime: '18:00',
        type: 'drop',
        dosage: '1 drop',
        isActive: true
      }
    });

    // Create sample medication logs
    await prisma.medicationLog.createMany({
      data: [
        { medicationId: med1.id, patientId: patient.id, scheduledTime: new Date(), taken: true, takenAt: new Date() },
        { medicationId: med2.id, patientId: patient.id, scheduledTime: new Date(), taken: false }
      ]
    });

    // Create sample vision test
    await prisma.visionTestResult.create({
      data: {
        patientId: patient.id,
        testName: 'Amsler Grid',
        testType: 'AmslerGrid',
        result: 'Normal',
        details: 'No distortion detected.',
        testDate: new Date()
      }
    });

    // Create sample articles
    await prisma.article.createMany({
      data: [
        {
          title: 'Computer Vision Syndrome: อาการตาล้าจากหน้าจอที่คนทำงานต้องระวัง',
          category: 'Eye Care',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
          content: `## Computer Vision Syndrome คืออะไร?

Computer Vision Syndrome (CVS) หรือ Digital Eye Strain เป็นกลุ่มอาการที่เกิดจากการใช้อุปกรณ์ดิจิทัลเป็นเวลานาน

### อาการที่พบบ่อย
- ปวดตา ตาล้า
- ตาแห้ง ตาพร่า
- ปวดหัว
- ปวดคอ บ่า ไหล่

### วิธีป้องกัน
1. กฎ 20-20-20: ทุก 20 นาที มองไปไกล 20 ฟุต เป็นเวลา 20 วินาที
2. ปรับแสงหน้าจอให้เหมาะสม
3. กะพริบตาบ่อยๆ
4. ใช้น้ำตาเทียม`,
          excerpt: 'เรียนรู้เกี่ยวกับ CVS และวิธีป้องกันอาการตาล้าจากหน้าจอ',
          readTime: '4 min',
          publishedAt: new Date('2023-10-10'),
          isPublished: true,
          viewCount: 150
        },
        {
          title: 'ต้อหิน (Glaucoma) ภัยเงียบที่ขโมยการมองเห็นของคุณ',
          category: 'Eye Disease',
          imageUrl: 'https://images.unsplash.com/photo-1579684385136-4f8995f52a76?auto=format&fit=crop&q=80&w=200',
          content: `## ต้อหินคืออะไร?

ต้อหินเป็นโรคที่ทำลายเส้นประสาทตา มักเกิดจากความดันในลูกตาสูง ถ้าไม่รักษาอาจนำไปสู่การตาบอดได้

### ประเภทของต้อหิน
- ต้อหินมุมเปิด (Open-angle Glaucoma)
- ต้อหินมุมปิด (Closed-angle Glaucoma)

### ปัจจัยเสี่ยง
- อายุมากกว่า 60 ปี
- มีประวัติครอบครัวเป็นต้อหิน
- เป็นเบาหวาน
- สายตาสั้นมาก

### การป้องกัน
ตรวจตาเป็นประจำทุกปี โดยเฉพาะผู้ที่มีอายุ 40 ปีขึ้นไป`,
          excerpt: 'ทำความรู้จักโรคต้อหิน สาเหตุ อาการ และการป้องกัน',
          readTime: '6 min',
          publishedAt: new Date('2023-10-05'),
          isPublished: true,
          viewCount: 200
        },
        {
          title: 'อาหารบำรุงสายตา 10 ชนิดที่ควรกินทุกวัน',
          category: 'Nutrition',
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200',
          content: `## อาหารที่ดีต่อสายตา

### 1. แครอท
อุดมด้วยเบต้าแคโรทีน ช่วยบำรุงสายตา

### 2. ผักใบเขียว
เช่น ผักโขม คะน้า มีลูทีนและซีแซนทิน

### 3. ปลาทะเล
โอเมก้า 3 ช่วยป้องกันตาแห้งและจอประสาทตาเสื่อม

### 4. ไข่
มีลูทีน ซีแซนทิน และวิตามินอี

### 5. ถั่ว
แหล่งวิตามินอีและกรดไขมันที่ดี`,
          excerpt: 'รู้จักอาหารที่ช่วยบำรุงดวงตาและป้องกันโรคตา',
          readTime: '5 min',
          publishedAt: new Date('2023-09-20'),
          isPublished: true,
          viewCount: 300
        }
      ]
    });

    // Create terms version
    await prisma.termsVersion.create({
      data: {
        version: '1.0.0',
        content: `# ข้อกำหนดและเงื่อนไขการใช้งาน POLACARE

## 1. การยอมรับข้อตกลง
เมื่อท่านใช้งานแอปพลิเคชัน POLACARE ถือว่าท่านยอมรับข้อกำหนดและเงื่อนไขทั้งหมด

## 2. การใช้งานข้อมูลส่วนบุคคล
เราจะเก็บรักษาข้อมูลของท่านตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562

## 3. ความรับผิดชอบ
ข้อมูลในแอปพลิเคชันเป็นข้อมูลเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์`,
        effectiveDate: new Date('2024-01-01'),
        isActive: true
      }
    });

    // Create sample consent
    await prisma.consent.create({
      data: {
        userId: patient.id,
        termsVersion: '1.0.0',
        consentType: 'terms',
        accepted: true,
        acceptedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script'
      }
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Accounts:');
    console.log('  Admin:   +66800000001 / admin123');
    console.log('  Doctor:  +66800000002 / doctor123');
    console.log('  Patient: +66812345678 / password123');
    console.log('\n🏥 Sample Data Created:');
    console.log('  - 3 Users (admin, doctor, patient)');
    console.log('  - 2 Patient Cases with checklists');
    console.log('  - 2 Medications with logs');
    console.log('  - 1 Vision Test Result');
    console.log('  - 3 Articles');
    console.log('  - Terms Version 1.0.0');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seed();
