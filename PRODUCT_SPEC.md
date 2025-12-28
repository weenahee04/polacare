# Product Specification: POLACARE
## Patient Portal for Eye Care Management

---

## 1. Executive Summary

**POLACARE** เป็นแพลตฟอร์ม Patient Portal สำหรับการดูแลสุขภาพดวงตาที่ให้ผู้ป่วยสามารถเข้าถึงข้อมูลการรักษา ผลการตรวจ และเครื่องมือดูแลสุขภาพตาได้อย่างสะดวกผ่านแอปพลิเคชันเว็บ

### 1.1 วัตถุประสงค์หลัก
- ให้ผู้ป่วยเข้าถึงประวัติการรักษาและผลการตรวจได้ตลอดเวลา
- สนับสนุนการดูแลสุขภาพตาด้วยเครื่องมือทดสอบและติดตามยาด้วยตนเอง
- เพิ่มความสะดวกในการจัดการข้อมูลสุขภาพส่วนบุคคล
- สร้างประสบการณ์การใช้งานที่ทันสมัยและใช้งานง่าย

### 1.2 กลุ่มเป้าหมาย
- ผู้ป่วยที่รับการรักษาจากโรงพยาบาล/คลินิกจักษุแพทย์
- ผู้ที่ต้องการติดตามสุขภาพดวงตาด้วยตนเอง
- ผู้ที่ต้องการเข้าถึงข้อมูลการรักษาแบบดิจิทัล

---

## 2. Product Overview

### 2.1 ชื่อผลิตภัณฑ์
**POLACARE** - Patient Portal

### 2.2 Technology Stack
- **Frontend Framework**: React 19.2.3
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **UI Icons**: Lucide React
- **AI Integration**: Google Gemini API (พร้อมใช้งาน)
- **Styling**: Tailwind CSS (inline classes)

### 2.3 Platform
- Web Application (Responsive Design)
- รองรับการใช้งานบน Desktop และ Mobile Browser

---

## 3. Core Features

### 3.1 Authentication & Onboarding

#### 3.1.1 Login Screen
- **การยืนยันตัวตน**: ระบบ OTP ผ่านเบอร์โทรศัพท์
- **ขั้นตอนการเข้าสู่ระบบ**:
  1. กรอกเบอร์โทรศัพท์ (รองรับ +66)
  2. รับรหัส OTP (6 หลัก)
  3. ยืนยันรหัสและเข้าสู่ระบบ
- **Features**:
  - Timer สำหรับการส่ง OTP ใหม่ (60 วินาที)
  - Validation สำหรับเบอร์โทรศัพท์
  - Navigation ไปยังหน้าสมัครสมาชิก

#### 3.1.2 Register Screen
- **ข้อมูลที่ต้องกรอก**:
  - รูปโปรไฟล์ (อัปโหลดได้)
  - ชื่อ-นามสกุล
  - เบอร์โทรศัพท์
  - เพศ (Male/Female/Other)
  - วันเกิด
  - น้ำหนัก (kg)
  - ส่วนสูง (cm)
  - รหัสผ่าน
- **Auto-calculation**: คำนวณ BMI อัตโนมัติ
- **HN Generation**: สร้างหมายเลข HN อัตโนมัติ

#### 3.1.3 Terms & Conditions Screen
- หน้าข้อกำหนดและเงื่อนไขก่อนการสมัครสมาชิก
- ต้องยอมรับก่อนเข้าสู่หน้าสมัครสมาชิก

#### 3.1.4 Welcome Guide Modal
- แสดงเมื่อเข้าสู่ระบบครั้งแรก
- แนะนำการใช้งานแอปพลิเคชัน

---

### 3.2 Patient Dashboard (Home)

#### 3.2.1 Digital Health ID Card
- **ข้อมูลที่แสดง**:
  - รูปโปรไฟล์
  - ชื่อ-นามสกุล
  - HN (Hospital Number)
  - อายุและเพศ
  - สถานะการยืนยันตัวตน (Verified Badge)
  - สถิติสุขภาพ: น้ำหนัก, ส่วนสูง, BMI
- **QR Code**: สำหรับสแกนที่จุดบริการโรงพยาบาล
- **Design**: Gradient Blue Theme

#### 3.2.2 Health Alert Banner
- แจ้งเตือนการรับประทานยา/หยอดตา
- แสดงชื่อยาและเวลาที่ต้องใช้
- ปุ่มยืนยันการรับยา

#### 3.2.3 Quick Actions Grid
- **ผลการตรวจ (Exam Results)**: นำทางไปยัง Records
- **ภาพถ่ายตา (Slit Lamp Images)**: นำทางไปยัง Records
- **นัดหมาย (Appointments)**: ฟีเจอร์กำลังพัฒนา
- **ปรึกษาแพทย์ (Doctor Consultation)**: ฟีเจอร์กำลังพัฒนา

#### 3.2.4 Wellness Banners
- Banner Carousel สำหรับแสดงข้อมูลสุขภาพ
- แนะนำบทความและกิจกรรม

#### 3.2.5 Next Appointment Card
- แสดงการนัดหมายถัดไป
- ข้อมูล: วันที่, เวลา, แพทย์, สถานที่
- ปุ่มดูการนัดหมายทั้งหมด

#### 3.2.6 Recent Article Teaser
- แสดงบทความล่าสุด
- นำทางไปยัง Eye Care Center

---

### 3.3 Medical Records (Records)

#### 3.3.1 Records List View
- แสดงรายการประวัติการรักษาทั้งหมด
- **ข้อมูลแต่ละรายการ**:
  - รูปภาพ Slit Lamp
  - วันที่ตรวจ
  - คำวินิจฉัย (Diagnosis)
  - ข้อความวิเคราะห์จาก AI
  - สถานะ (Completed)
- **Interaction**: คลิกเพื่อดูรายละเอียด

#### 3.3.2 Case Detail View
- **Header**:
  - ปุ่มย้อนกลับ
  - HN และวันที่ตรวจ
  - ปุ่มแชร์ผลการตรวจ
- **Content Sections**:
  1. **Slit Lamp Image**: ภาพหลักของการตรวจ
  2. **Diagnosis Summary**: คำวินิจฉัยหลัก
  3. **Doctor's Notes**: หมายเหตุจากแพทย์
  4. **Structural Findings**: รายละเอียดโครงสร้างตา (Checklist)
     - Lids/Lashes
     - Conjunctiva
     - Cornea
     - Anterior Chamber
     - Iris
     - Lens
     - แต่ละรายการแสดงสถานะ: Observed/Not Observed, Verified

---

### 3.4 Eye Care Center (Care)

#### 3.4.1 Header Section
- **Telemedicine Banner**: 
  - ปรึกษาจักษุแพทย์ออนไลน์
  - Video Call กับแพทย์
  - ปุ่มโทรปรึกษา (กำลังพัฒนา)

#### 3.4.2 Vision Screening Tools
- **AI Retinal Age Scan**:
  - วิเคราะห์อายุหลอดเลือดตาด้วย AI
  - เปรียบเทียบอายุจริงกับอายุที่ AI ประเมิน
  - แสดงปัจจัยเสี่ยง
- **Amsler Grid Test**:
  - ทดสอบจอประสาทตา
  - ตรวจจับความผิดปกติของ Macula
- **Ishihara Test**:
  - ทดสอบตาบอดสี
  - แสดงผล Normal/Abnormal
- **Recent Test Results**: แสดงผลการทดสอบล่าสุด

#### 3.4.3 Medication Tracker
- **รายการยา**:
  - ชื่อยา
  - ความถี่ในการใช้ (เช่น 4 times/day)
  - เวลาถัดไปที่ต้องใช้
  - ประเภท: ยาหยอดตา (Drop) / ยาทาน (Pill)
- **Features**:
  - ปุ่มเช็คเพื่อบันทึกการรับยา
  - เพิ่มรายการยาใหม่
  - Modal สำหรับเพิ่มยา (ชื่อ, ความถี่, เวลา, ประเภท)

#### 3.4.4 Eye Health Articles
- แสดงบทความเกี่ยวกับสุขภาพตา
- **ข้อมูลบทความ**:
  - หัวข้อ
  - หมวดหมู่
  - รูปภาพ
  - เวลาอ่าน
  - วันที่เผยแพร่
- **Article Reader**: หน้าอ่านบทความแบบเต็ม

#### 3.4.5 Appointment Reminder
- แจ้งเตือนการนัดหมาย
- ปุ่มจองคิวตรวจ

---

### 3.5 Profile Management

#### 3.5.1 Profile View
- **ข้อมูลส่วนตัว**:
  - รูปโปรไฟล์
  - ชื่อ-นามสกุล
  - HN
  - สถานะ: Patient Account
- **Menu Options**:
  - ข้อมูลส่วนตัว (Personal Info) - กำลังพัฒนา
  - การนัดหมาย (Appointments) - กำลังพัฒนา
  - Sign Out

---

## 4. UI/UX Design

### 4.1 Design System

#### 4.1.1 Color Palette
- **Primary Blue**: `#0056b3`, `#00a8e8`
- **Background**: `#f8faff` (Light Blue-Gray)
- **Text**: `#1e293b` (Slate-800), `#64748b` (Slate-500)
- **Success**: Green tones
- **Warning**: Orange tones
- **Error**: Red tones

#### 4.1.2 Typography
- **Font Family**: Kanit (Thai), Inter (English)
- **Font Weights**: Bold, Medium, Regular
- **Font Sizes**: 10px - 3xl

#### 4.1.3 Components Style
- **Cards**: Rounded-2xl, White background, Shadow-sm
- **Buttons**: Rounded-xl/2xl, Gradient backgrounds
- **Inputs**: Rounded-xl, Border focus states
- **Icons**: Lucide React icons

#### 4.1.4 Layout
- **Top Bar**: Sticky header with logo and profile avatar
- **Bottom Navigation**: 4 tabs (Home, Records, Care, Me)
- **Content Area**: Scrollable with padding
- **Modals**: Full-screen overlays with backdrop blur

### 4.2 Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Touch-friendly interactions
- Optimized for small screens

### 4.3 Animations
- Fade-in animations
- Scale transitions on buttons
- Smooth scrolling
- Loading states

---

## 5. Data Models

### 5.1 UserProfile
```typescript
{
  name: string;
  hn: string;
  phoneNumber: string;
  avatarUrl?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  weight: number;
  height: number;
  bmi: number;
}
```

### 5.2 PatientCase
```typescript
{
  id: string;
  hn: string;
  patientName: string;
  date: Date;
  imageUrl: string;
  aiAnalysisText: string;
  checklist: MedicalChecklist;
  doctorNotes?: string;
  diagnosis: string;
  leftEye: EyeExamData;
  rightEye: EyeExamData;
  status: 'Draft' | 'Finalized';
}
```

### 5.3 MedicalChecklist
```typescript
{
  title: string;
  items: ChecklistItem[];
}

ChecklistItem {
  id: string;
  category: string;
  label: string;
  isObserved: boolean;
  isVerified: boolean;
}
```

### 5.4 EyeDropSchedule
```typescript
{
  id: string;
  medicineName: string;
  frequency: string;
  nextTime: string;
  taken: boolean;
  type: 'drop' | 'pill';
}
```

### 5.5 VisionTestResult
```typescript
{
  testName: string;
  date: Date;
  result: 'Normal' | 'Abnormal' | string;
  details: string;
}
```

### 5.6 Article
```typescript
{
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  readTime: string;
  date: string;
}
```

---

## 6. AI Integration

### 6.1 Current Status
- **Gemini Service**: พร้อมใช้งาน (แต่ยังใช้ Mock Data)
- **Functions Available**:
  - `analyzeMedicalImage()`: วิเคราะห์ภาพ Slit Lamp
  - `analyzeRetinalAge()`: วิเคราะห์อายุหลอดเลือดตา
  - `generateHealthAdvice()`: ให้คำแนะนำสุขภาพ
  - `generateArticleContent()`: สร้างเนื้อหาบทความ
  - `extractKnowledgeGraph()`: สร้าง Knowledge Graph

### 6.2 AI Features (Planned)
- AI-powered image analysis for Slit Lamp photos
- Retinal age prediction from fundus images
- Automated checklist generation
- Health advice generation
- Knowledge graph visualization

---

## 7. Navigation Structure

```
App
├── Authentication Flow
│   ├── Login Screen
│   ├── Terms Screen
│   └── Register Screen
│
└── Main App (Authenticated)
    ├── Home Tab
    │   └── Patient Dashboard
    │
    ├── Records Tab
    │   ├── Records List
    │   └── Case Detail View
    │
    ├── Care Tab
    │   ├── Eye Care Center Dashboard
    │   ├── Amsler Grid Test
    │   ├── Ishihara Test
    │   ├── Retinal Age Test
    │   ├── Article Reader
    │   └── Add Medicine Modal
    │
    └── Profile Tab
        └── Profile View
```

---

## 8. User Flows

### 8.1 First Time User Flow
1. เปิดแอป → Login Screen
2. คลิก "สมัครสมาชิก"
3. อ่าน Terms & Conditions → ยอมรับ
4. กรอกข้อมูล Register → สร้างบัญชี
5. แสดง Welcome Guide Modal
6. เข้าสู่ Dashboard

### 8.2 Returning User Flow
1. เปิดแอป → Login Screen
2. กรอกเบอร์โทรศัพท์ → Request OTP
3. รับ OTP → Verify
4. เข้าสู่ Dashboard

### 8.3 View Medical Records Flow
1. Dashboard → คลิก "ผลการตรวจ" หรือ Records Tab
2. ดูรายการ Records
3. คลิกรายการ → ดู Case Detail
4. ดูภาพ, Diagnosis, Checklist
5. คลิก Back → กลับไป Records List

### 8.4 Vision Test Flow
1. Care Tab → เลือก Vision Test
2. ทำการทดสอบ (Amsler/Ishihara/Retinal Age)
3. ดูผลการทดสอบ
4. บันทึกผล → กลับไป Dashboard

### 8.5 Medication Tracking Flow
1. Care Tab → Medication Tracker
2. ดูรายการยา
3. คลิกเช็คเมื่อรับยา → บันทึก
4. เพิ่มยาหรือแก้ไขเวลา

---

## 9. Notifications System

### 9.1 Notification Types
- **Success**: การดำเนินการสำเร็จ
- **Error**: เกิดข้อผิดพลาด
- **Info**: ข้อมูลทั่วไป
- **Warning**: คำเตือน

### 9.2 Notification Triggers
- บันทึกการรับยาสำเร็จ
- เพิ่มรายการยาสำเร็จ
- บันทึกผลการทดสอบ
- แชร์ผลการตรวจ
- ฟีเจอร์ที่กำลังพัฒนา

---

## 10. Features Under Development

### 10.1 Planned Features
- **Appointment Management**: จอง/ดู/ยกเลิกการนัดหมาย
- **Telemedicine**: Video call กับแพทย์
- **Personal Info Editing**: แก้ไขข้อมูลส่วนตัว
- **Doctor Consultation**: ปรึกษาแพทย์ออนไลน์
- **AI Image Analysis**: วิเคราะห์ภาพจริงด้วย AI
- **Knowledge Graph**: แสดงความสัมพันธ์ของข้อมูลทางการแพทย์
- **Health Reports**: สร้างรายงานสุขภาพ

---

## 11. Technical Requirements

### 11.1 Performance
- Fast initial load time
- Smooth scrolling and animations
- Optimized image loading
- Efficient state management

### 11.2 Security
- OTP-based authentication
- Secure data storage (planned)
- HTTPS encryption (required for production)
- Privacy compliance (PDPA)

### 11.3 Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch-friendly UI elements

### 11.4 Browser Support
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 12. Future Enhancements

### 12.1 Phase 2 Features
- Push notifications
- Offline mode support
- Multi-language support (EN/TH)
- Dark mode
- Export medical records (PDF)
- Integration with hospital systems (HL7/FHIR)

### 12.2 Phase 3 Features
- Wearable device integration
- AI-powered health insights
- Community features
- Gamification (health points, rewards)
- Telemedicine full implementation
- Advanced analytics dashboard

---

## 13. Success Metrics

### 13.1 User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Feature adoption rate

### 13.2 Medical Outcomes
- Medication adherence rate
- Vision test completion rate
- Appointment attendance rate
- User satisfaction score

### 13.3 Technical Metrics
- App load time
- Error rate
- API response time
- Uptime percentage

---

## 14. Appendix

### 14.1 File Structure
```
polacare/
├── App.tsx                 # Main app component
├── index.tsx               # Entry point
├── types.ts                # TypeScript types
├── metadata.json           # App metadata
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── components/             # React components
│   ├── PatientDashboard.tsx
│   ├── EyeCareCenter.tsx
│   ├── CaseDetailView.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── AmslerGridTest.tsx
│   ├── IshiharaTest.tsx
│   ├── RetinalAgeTest.tsx
│   └── ... (other components)
└── services/
    └── geminiService.ts     # AI service integration
```

### 14.2 Key Dependencies
- `react`: ^19.2.3
- `react-dom`: ^19.2.3
- `@google/genai`: ^1.34.0
- `lucide-react`: ^0.562.0
- `typescript`: ~5.8.2
- `vite`: ^6.2.0

---

## 15. Contact & Support

### 15.1 Development Team
- Product: POLACARE Development Team
- Repository: Available in workspace

### 15.2 Documentation
- This Product Specification
- Code comments in source files
- Component documentation (inline)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Active Development

