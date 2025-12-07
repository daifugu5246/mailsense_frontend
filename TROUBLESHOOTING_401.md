# Troubleshooting: Error 401 from Backend

## ปัญหา
เมื่อคลิก Login with Google แล้ว redirect กลับมาพร้อม error:
```
http://localhost:3000/dashboard?error=Request%20failed%20with%20status%20code%20401
```

## สาเหตุที่เป็นไปได้

### 1. Backend ไม่สามารถ Exchange Code สำหรับ Token ได้

**ตรวจสอบ:**
- Google Client ID และ Client Secret ใน backend `.env` ถูกต้องหรือไม่
- Redirect URI ใน Google Console ตรงกับ backend callback URL หรือไม่
  - ควรเป็น: `http://localhost:8000/api/auth/google/callback` (หรือ port ที่ backend ใช้)

**แก้ไข:**
```env
# Backend .env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### 2. Backend Callback มีปัญหา

**ตรวจสอบ backend callback code:**
- ตรวจสอบว่า backend callback route ทำงานถูกต้อง
- ตรวจสอบ error logs ใน backend console
- ตรวจสอบว่า axios request ไป Google token endpoint สำเร็จหรือไม่

**ตัวอย่าง backend callback ที่ถูกต้อง:**
```javascript
router.get('/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${encodeURIComponent('No authorization code')}`);
    }

    // Exchange code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    // ... rest of the code
    
    // If successful, redirect with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=true`);
  } catch (err) {
    console.error('Callback error:', err);
    const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${encodeURIComponent(errorMessage)}`);
  }
});
```

### 3. Cookie ไม่ถูกส่งไปยัง Frontend

**ตรวจสอบ:**
- Backend ตั้งค่า CORS ให้อนุญาต credentials หรือไม่
- Cookie settings ถูกต้องหรือไม่

**Backend CORS settings:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:3000
  credentials: true, // สำคัญ!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Cookie settings:**
```javascript
res.cookie('access_token', access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: expires_in * 1000,
  domain: undefined, // หรือ domain ที่ถูกต้อง
  path: '/',
});
```

### 4. Backend `/api/auth/me` Endpoint ไม่ทำงาน

**ตรวจสอบ:**
- Endpoint `/api/auth/me` มีอยู่จริงหรือไม่
- Endpoint อ่าน cookie ได้หรือไม่
- Endpoint return user data ถูกต้องหรือไม่

**ตัวอย่าง `/api/auth/me` endpoint:**
```javascript
router.get('/me', async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    
    console.log('Access token from cookie:', accessToken ? 'Present' : 'Missing');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized - No token' });
    }

    // Verify token and get user email
    // Option 1: Decode JWT token (if using JWT)
    // Option 2: Get from database using token
    
    // Example: Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id, email, display_name, domain, picture')
      .eq('email', userEmail) // Get from token or session
      .single();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## วิธี Debug

### 1. ตรวจสอบ Browser Console
- เปิด Developer Tools (F12)
- ไปที่ Console tab
- ดู error messages และ logs

### 2. ตรวจสอบ Network Tab
- เปิด Developer Tools (F12)
- ไปที่ Network tab
- คลิก Login และดู requests:
  - Request ไป Google OAuth
  - Request ไป backend callback
  - Request ไป `/api/auth/me`
- ตรวจสอบ response และ cookies

### 3. ตรวจสอบ Backend Logs
- ดู console logs ใน backend server
- ตรวจสอบ error messages
- ตรวจสอบว่า requests มาถึง backend หรือไม่

### 4. ตรวจสอบ Cookies
- เปิด Developer Tools (F12)
- ไปที่ Application tab > Cookies
- ตรวจสอบว่า `access_token` cookie ถูกตั้งค่าหรือไม่
- ตรวจสอบ cookie domain และ path

## Checklist

- [ ] Google Client ID และ Client Secret ถูกต้อง
- [ ] Redirect URI ใน Google Console ตรงกับ backend callback URL
- [ ] Backend server กำลังรันอยู่
- [ ] Backend CORS อนุญาต credentials
- [ ] Backend callback route ทำงานถูกต้อง
- [ ] Backend `/api/auth/me` endpoint มีอยู่และทำงาน
- [ ] Cookie ถูกตั้งค่าถูกต้อง
- [ ] Frontend `.env` มี `VITE_BACKEND_URL` ถูกต้อง

## Quick Fix

1. **ตรวจสอบ backend callback:**
   ```bash
   # ดู backend logs เมื่อคลิก login
   ```

2. **ทดสอบ backend endpoint:**
   ```bash
   # ทดสอบว่า /api/auth/me ทำงานหรือไม่
   curl http://localhost:8000/api/auth/me -v
   ```

3. **ตรวจสอบ Google OAuth settings:**
   - ไปที่ Google Cloud Console
   - ตรวจสอบ Authorized redirect URIs
   - ตรวจสอบ Client ID และ Secret

4. **Clear cookies และลองใหม่:**
   - ลบ cookies ทั้งหมด
   - Restart backend server
   - ลอง login ใหม่

