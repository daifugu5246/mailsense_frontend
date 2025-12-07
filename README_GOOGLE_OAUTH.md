# Google OAuth Setup Guide

## ขั้นตอนการตั้งค่า Google OAuth

### 1. สร้าง Google OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มีอยู่
3. ไปที่ **APIs & Services** > **Credentials**
4. คลิก **Create Credentials** > **OAuth client ID**
5. ถ้ายังไม่ได้ตั้งค่า OAuth consent screen:
   - ไปที่ **OAuth consent screen**
   - เลือก **External** (สำหรับ development)
   - กรอกข้อมูลที่จำเป็น (App name, User support email)
   - เพิ่ม scopes: `email`, `profile`, `openid`
   - เพิ่ม test users (ถ้าเป็น testing mode)
   - บันทึกและดำเนินการต่อ

6. สร้าง OAuth Client ID:
   - Application type: **Web application**
   - Name: MailSense (หรือชื่อที่คุณต้องการ)
   - **Authorized redirect URIs**: 
     - `http://localhost:8000/api/auth/google/callback` (backend callback - สำหรับ development)
     - `https://yourdomain.com/api/auth/google/callback` (backend callback - สำหรับ production)
   - คลิก **Create**
   - คัดลอก **Client ID** และ **Client Secret**

### 2. ตั้งค่า Environment Variables

#### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_BACKEND_URL=http://localhost:8000
```

#### Backend (.env)
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### 3. ตั้งค่า Backend Endpoints

Backend ต้องมี endpoints ต่อไปนี้ (ดูรายละเอียดใน `BACKEND_REQUIREMENTS.md`):

1. **`GET /api/auth/google/callback`** - รับ OAuth callback จาก Google
   - Exchange code สำหรับ token
   - บันทึก user ใน database
   - เก็บ access_token ใน HTTP-only cookie
   - Redirect ไป `FRONTEND_URL/dashboard?success=true`

2. **`GET /api/auth/me`** - ดึงข้อมูล user ปัจจุบัน
   - อ่าน access_token จาก cookie
   - Return user data

3. **`POST /api/auth/logout`** - Logout user
   - ลบ access_token cookie

**หมายเหตุ**: ดูโค้ดตัวอย่างใน `BACKEND_REQUIREMENTS.md`

### 4. ทดสอบ

1. รัน Backend server (port 8000)
2. รัน Frontend: `npm run dev` (port 3000)
3. คลิกปุ่ม "Login with Google"
4. เลือกบัญชี Google
5. อนุญาตการเข้าถึง
6. Backend จะ process callback และ redirect กลับมาที่ `/dashboard?success=true`
7. Frontend จะดึงข้อมูล user จาก backend และแสดงผล

## หมายเหตุ

- **Client Secret** ไม่ควรถูกเก็บใน frontend code
- สำหรับ production ควรใช้ backend endpoint สำหรับ token exchange
- ตรวจสอบว่า redirect URI ใน Google Console ตรงกับ URL ที่ใช้จริง
- สำหรับ development ใช้ `http://localhost:3000`
- สำหรับ production ใช้ `https://yourdomain.com`

## Troubleshooting

### Error: "Invalid redirect URI"
- ตรวจสอบว่า redirect URI ใน Google Console ตรงกับ URL ที่ใช้
- ต้องตรงกันทุกตัวอักษร (รวม http/https, port, path)

### Error: "Access blocked: This app's request is invalid"
- ตรวจสอบว่า OAuth consent screen ตั้งค่าถูกต้อง
- ถ้าเป็น testing mode ต้องเพิ่ม test users

### Error: "Failed to exchange code for token"
- ตรวจสอบว่า backend endpoint ทำงานถูกต้อง
- ตรวจสอบว่า client_secret ถูกต้อง
- ตรวจสอบ network tab ใน browser console

