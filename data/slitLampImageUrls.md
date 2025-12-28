# Slit Lamp Examination Images

## รูปภาพดวงตาจาก Slit Lamp สำหรับ Mock Data

### หมายเหตุ
รูปภาพที่ใช้ใน mock data นี้เป็นรูปตัวอย่างจาก Unsplash ซึ่งเป็นรูปทั่วไปเกี่ยวกับดวงตา
**สำหรับการใช้งานจริง ควรใช้รูปภาพจริงจาก Slit Lamp Examination**

### แหล่งข้อมูลรูปภาพ Slit Lamp จริง

1. **Medical Image Databases (Free/Open Access)**:
   - Open-i (https://openi.nlm.nih.gov/) - Medical image search
   - Wikimedia Commons - Medical images
   - PubMed Central - Medical journals with images

2. **Search Terms สำหรับ Google Images**:
   - "slit lamp examination eye"
   - "slit lamp biomicroscopy"
   - "ophthalmology slit lamp"
   - "anterior segment eye examination"

3. **Medical Education Resources**:
   - EyeWiki (American Academy of Ophthalmology)
   - Atlas of Ophthalmology
   - Medical school ophthalmology resources

### ข้อควรระวัง
- ตรวจสอบลิขสิทธิ์ของรูปภาพก่อนใช้งาน
- สำหรับการใช้งานจริง ควรใช้รูปภาพจากผู้ป่วยจริงที่ได้รับอนุญาต
- รูปภาพทางการแพทย์อาจมีข้อจำกัดในการใช้งาน

---

## Mock Data Image URLs (Current)

1. **Case 001** (Macular Degeneration):
   - `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&q=90`

2. **Case 002** (Cataract):
   - `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=90`

3. **Case 003** (Normal):
   - `https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop&q=90`

4. **Case 004** (Dry Eye):
   - `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=90`

5. **Case 005** (Follow-up):
   - `https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop&q=90`

---

## วิธีอัพเดทรูปภาพ

หากต้องการเปลี่ยนรูปภาพ:

1. หา URL รูปภาพ Slit Lamp ที่เหมาะสม
2. แก้ไข `imageUrl` ใน `data/mockCases.ts`
3. ตรวจสอบว่า URL ใช้งานได้และไม่มี CORS issues

