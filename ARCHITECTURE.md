# معمارية المشروع - Telegram Clone

## 🏗️ نظرة عامة على البنية

هذا المشروع يتبع معمارية **Client-Server منفصلة** حيث:

```
┌─────────────────────────────────────────────────────────────┐
│                      المستخدمون (Users)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application (Vercel.com)               │
│  - واجهة المستخدم (UI)                                       │
│  - المصادقة والتوجيه (Auth & Routing)                        │
│  - إدارة الحالة (State Management - Zustand)                │
│  - التخزين المؤقت للرسائل (Local Message Cache)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket Connection
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Socket.IO Server (Render.com)                    │
│  - إدارة الاتصالات الفورية (Real-time Connections)          │
│  - بث الرسائل (Message Broadcasting)                        │
│  - إدارة الغرف والقنوات (Room Management)                    │
│  - حالة الاتصال (Online Status)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Database)                       │
│  - تخزين المستخدمين (Users)                                 │
│  - تخزين الرسائل (Messages)                                 │
│  - الغرف والقنوات (Rooms & Channels)                        │
│  - الملفات المرفقة (Attachments Metadata)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Cloudinary (Media Storage)                   │
│  - تخزين الصور (Images)                                     │
│  - تخزين الفيديوهات (Videos)                                │
│  - تخزين الملفات (Files)                                    │
│  - الرسائل الصوتية (Voice Messages)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 هيكل المجلدات

```
telegram-clone/
│
├── src/                          # تطبيق Next.js
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   ├── auth/                 # صفحات المصادقة
│   │   └── ...
│   ├── components/               # مكونات React
│   │   ├── leftBar/              # الشريط الجانبي الأيسر
│   │   ├── middleBar/            # منطقة الدردشة الوسطى
│   │   ├── rightBar/             # الشريط الجانبي الأيمن
│   │   └── modules/              # مكونات قابلة لإعادة الاستخدام
│   ├── stores/                   # Zustand State Management
│   ├── schemas/                  # MongoDB Schemas
│   ├── utils/                    # دوال مساعدة
│   └── models/                   # TypeScript Models
│
├── server/                       # خادم Socket.IO
│   └── index.js                  # نقطة البداية للخادم
│
├── public/                       # الملفات الثابتة
│
├── .env                          # متغيرات البيئة
├── package.json                  # التبعيات
├── render.yaml                   # تكوين Render.com
├── vercel.json                   # تكوين Vercel
└── DEPLOYMENT.md                 # دليل النشر
```

---

## 🔄 تدفق البيانات (Data Flow)

### 1. إرسال رسالة جديدة

```
User Types Message
       │
       ▼
MessageInput Component
       │
       ▼
Local State Update (Pending Status)
       │
       ▼
Emit 'newMessage' via Socket.IO
       │
       ▼
Socket.IO Server (Render.com)
       │
       ├─▶ Save to MongoDB
       │
       └─▶ Broadcast to Room Members
              │
              ▼
       All Connected Clients Receive Message
              │
              ▼
       Update Local State (Sent Status)
```

### 2. رفع ملف (File Upload)

```
User Selects File
       │
       ▼
FilePreview Component
       │
       ▼
Upload to Cloudinary
       │  (with progress tracking)
       ▼
Get Cloudinary URL
       │
       ▼
Send Message with File URL
       │
       ▼
Socket.IO Server
       │
       ├─▶ Save to MongoDB (with fileData)
       │
       └─▶ Broadcast to Room Members
              │
              ▼
       Clients Download/Display File
```

### 3. المصادقة (Authentication)

```
User Login/Register
       │
       ▼
Next.js API Route
       │
       ▼
Validate Credentials
       │
       ▼
Generate JWT Token
       │
       ▼
Store in Cookie/LocalStorage
       │
       ▼
Connect to Socket.IO Server
       │
       ▼
Verify JWT on Server
       │
       ▼
Establish WebSocket Connection
```

---

## 🔌 اتصال Socket.IO

### Events المستخدمة:

#### من العميل إلى الخادم (Client → Server):
- `newMessage`: إرسال رسالة جديدة
- `editMessage`: تعديل رسالة موجودة
- `deleteMessage`: حذف رسالة
- `typing`: المستخدم يكتب
- `stop-typing`: المستخدم توقف عن الكتابة
- `createRoom`: إنشاء غرفة جديدة
- `joinRoom`: الانضمام إلى غرفة
- `leaveRoom`: مغادرة غرفة
- `markAsRead`: تحديد الرسالة كمقروءة

#### من الخادم إلى العميل (Server → Client):
- `newMessage`: رسالة جديدة من مستخدم آخر
- `newMessageIdUpdate`: تحديث معرف الرسالة المؤقتة
- `messageEdited`: تم تعديل رسالة
- `messageDeleted`: تم حذف رسالة
- `typing`: مستخدم يكتب
- `stop-typing`: مستخدم توقف عن الكتابة
- `lastMsgUpdate`: تحديث آخر رسالة في الغرفة
- `updateLastMsgData`: تحديث بيانات آخر رسالة
- `userOnline`: مستخدم متصل
- `userOffline`: مستخدم غير متصل

---

## 💾 إدارة الحالة (State Management)

يستخدم المشروع **Zustand** لإدارة الحالة العامة:

### Stores الرئيسية:

1. **useGlobalStore**: 
   - الغرفة المختارة حالياً
   - الوضع الحالي (مشغول، متاح، إلخ)
   - إعدادات التطبيق

2. **useUserStore**:
   - بيانات المستخدم الحالي
   - قائمة الغرف
   - جهات الاتصال

3. **useSockets**:
   - اتصال Socket.IO
   - حالة الاتصال
   - Reconnection logic

---

## 🔐 الأمان (Security)

### Client-Side:
- JWT Tokens للمصادقة
- Input Validation
- XSS Protection (React built-in)
- HTTPS Only (production)

### Server-Side:
- JWT Verification
- Rate Limiting (يمكن إضافته)
- CORS Configuration
- Input Sanitization
- MongoDB Injection Protection

### Database:
- Password Hashing (bcrypt)
- Secure Connection String
- Access Control (MongoDB Atlas)

---

## 🚀 تحسينات الأداء

1. **Optimistic Updates**:
   - تحديث الواجهة فوراً قبل تأكيد الخادم
   - إظهار حالة "pending" للرسائل

2. **Message Caching**:
   - تخزين الرسائل محلياً
   - تقليل الطلبات إلى الخادم

3. **Lazy Loading**:
   - تحميل الرسائل عند الحاجة
   - تحميل الصور بشكل كسول

4. **Connection Recovery**:
   - إعادة الاتصال التلقائية
   - إرسال الرسائل الفاشلة تلقائياً

---

## 🔧 متغيرات البيئة

### للتطبيق (Next.js):
```env
NEXT_PUBLIC_SOCKET_SERVER_URL=     # رابط خادم Socket.IO
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME= # اسم حساب Cloudinary
NEXT_PUBLIC_CLOUDINARY_API_KEY=    # مفتاح API
NEXT_PUBLIC_CLOUDINARY_API_SECRET= # Secret Key
MONGODB_URI=                       # رابط MongoDB
secretKey=                         # مفتاح JWT
NODE_ENV=                          # البيئة (development/production)
```

### للخادم (Socket.IO):
```env
MONGODB_URI=                       # رابط MongoDB
secretKey=                         # مفتاح JWT (نفس المفتاح)
NODE_ENV=                          # البيئة
```

---

## 📊 مقاييس الأداء

### توقعات الأداء:
- **زمن الاستجابة**: < 100ms (رسائل فورية)
- **حجم البناء**: ~500KB (gzipped)
- **Time to Interactive**: < 3s
- **Socket.IO Latency**: < 50ms

### قيود الخطة المجانية:
- **Render.com**: 
  - يتوقف الخادم بعد 15 دقيقة من عدم النشاط
  - 750 ساعة/شهر
  - يستيقظ في ~30 ثانية عند الطلب

- **Vercel.com**:
  - 100GB Bandwidth/شهر
  - 6000 دقيقة بناء/شهر
  - Serverless Functions: 100 ساعة/شهر

---

## 🔄 خطط التطوير المستقبلي

1. **تحسينات الأداء**:
   - [ ] Implement Redis for caching
   - [ ] Add CDN for static assets
   - [ ] Optimize bundle size

2. **ميزات جديدة**:
   - [ ] Video/Audio calls
   - [ ] Screen sharing
   - [ ] Stickers and GIFs
   - [ ] Message reactions

3. **تحسينات الأمان**:
   - [ ] End-to-End Encryption
   - [ ] Two-Factor Authentication
   - [ ] Rate Limiting
   - [ ] Spam Detection

4. **Mobile**:
   - [ ] React Native app
   - [ ] Better PWA support
   - [ ] Push Notifications

---

تم التحديث: أكتوبر 2025
