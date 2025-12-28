# 🔧 แก้ Build Error - Railway

## ❌ Error ที่เห็น

```
The "path" argument must be of type string. Received undefined
```

**สาเหตุ**: Railway ไม่รู้ว่า Root Directory คืออะไร

---

## ✅ วิธีแก้

### ตั้งค่า Root Directory ใน Railway Dashboard

1. **ไปที่ Railway Dashboard**
   - [railway.app](https://railway.app)
   - Login

2. **ไปที่ Backend Service**
   - คลิก Project → คลิก Backend service (`polacare-api`)

3. **เปิด Settings Tab**
   - คลิก **"Settings"** tab (ด้านบน)

4. **ตั้งค่า Root Directory**
   - หา **"Root Directory"** section
   - ใส่ค่า: `backend`
   - คลิก **"Save"** หรือ **"Update"**

5. **ตั้งค่า Build Command** (ถ้ายังไม่ได้ตั้ง)
   - หา **"Build Command"** section
   - ใส่ค่า:
     ```
     npm install --legacy-peer-deps && npx prisma@5.7.1 generate && npm run build
     ```
   - คลิก **"Save"**

6. **ตั้งค่า Start Command** (ถ้ายังไม่ได้ตั้ง)
   - หา **"Start Command"** section
   - ใส่ค่า:
     ```
     npx prisma@5.7.1 migrate deploy && npm start
     ```
   - คลิก **"Save"**

---

## 🔄 Redeploy

หลังตั้งค่าแล้ว:

1. Railway จะ redeploy อัตโนมัติ
2. หรือคลิก **"Deploy"** → **"Redeploy"**

---

## ✅ Checklist

- [ ] Root Directory = `backend` ตั้งค่าแล้ว
- [ ] Build Command ตั้งค่าแล้ว
- [ ] Start Command ตั้งค่าแล้ว
- [ ] Redeploy แล้ว
- [ ] Build สำเร็จแล้ว

---

## 📝 หมายเหตุ

- **Root Directory** = `backend` (สำคัญมาก!)
- Railway จะ build จาก folder `backend` เท่านั้น
- ถ้าไม่ตั้ง Root Directory → Railway จะ build จาก root folder → error!

---

ลองตั้งค่า Root Directory แล้ว redeploy ดูครับ!

