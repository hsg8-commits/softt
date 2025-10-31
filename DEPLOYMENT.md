# دليل النشر - Telegram Clone

## 🔧 المشكلة التي تم إصلاحها

تم إصلاح خطأ في ملف `FilePreview.tsx` كان يحتوي على أحرف `\n` حرفية بدلاً من أسطر جديدة حقيقية، مما تسبب في:
```
Error: x Expected unicode escape
```

## 📦 بنية المشروع

المشروع مقسم إلى جزأين منفصلين:

### 1. خادم Socket.IO (للتشغيل على Render.com)
- **الملف**: `server/index.js`
- **المنفذ**: 3001
- **الوظيفة**: إدارة الاتصالات الفورية والرسائل

### 2. تطبيق Next.js (للتشغيل على Vercel.com)
- **المجلد**: `src/`
- **الوظيفة**: واجهة المستخدم والتطبيق الرئيسي

---

## 🚀 النشر على Render.com (خادم Socket.IO)

### الخطوات:

1. **افتح Render.com وسجل الدخول**
   - اذهب إلى: https://render.com

2. **أنشئ Web Service جديد**
   - انقر على "New +" → "Web Service"

3. **اربط مستودع GitHub**
   - اختر المستودع الخاص بك

4. **إعدادات الخدمة**:
   ```
   Name: telegram-clone-socket-server
   Environment: Node
   Branch: main
   Build Command: npm install
   Start Command: npm run server
   ```

5. **إضافة متغيرات البيئة** (Environment Variables):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://sjgdsoft:sjgdsoft%401234@cluster0.kyfjlde.mongodb.net/telegram_clone_db?retryWrites=true&w=majority&appName=Cluster0
   secretKey=telegram_clone_secret_key_2024_random_secure_string_for_jwt_token_generation
   ```

6. **انقر على "Create Web Service"**

7. **انسخ الرابط** الذي سيظهر بعد النشر (مثال: `https://telegram-clone-socket-server.onrender.com`)

---

## 🌐 النشر على Vercel.com (تطبيق Next.js)

### الخطوات:

1. **افتح Vercel.com وسجل الدخول**
   - اذهب إلى: https://vercel.com

2. **استورد المشروع**
   - انقر على "Add New..." → "Project"
   - اختر المستودع من GitHub

3. **إعدادات المشروع**:
   ```
   Framework Preset: Next.js
   Build Command: next build
   Output Directory: .next
   Install Command: npm install
   ```

4. **إضافة متغيرات البيئة** (Environment Variables):
   
   انقر على "Environment Variables" وأضف التالي:

   ```
   NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-render-server-url.onrender.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dta1febjy
   NEXT_PUBLIC_CLOUDINARY_API_KEY=289218193982333
   NEXT_PUBLIC_CLOUDINARY_API_SECRET=SkXSJ9eZTb5wtOyGYwrk2vc1Luo
   MONGODB_URI=mongodb+srv://sjgdsoft:sjgdsoft%401234@cluster0.kyfjlde.mongodb.net/telegram_clone_db?retryWrites=true&w=majority&appName=Cluster0
   secretKey=telegram_clone_secret_key_2024_random_secure_string_for_jwt_token_generation
   NODE_ENV=production
   ```

   **⚠️ مهم جداً**: استبدل `https://your-render-server-url.onrender.com` برابط خادم Render الذي نسخته في الخطوة 7 أعلاه!

5. **انقر على "Deploy"**

6. **انتظر حتى يكتمل البناء** (قد يستغرق 2-5 دقائق)

---

## 🔍 حل المشاكل الشائعة

### 1. خطأ في البناء على Render
**المشكلة**: `Error: x Expected unicode escape`
**الحل**: تم إصلاحه في التحديث الأخير. قم بسحب آخر التحديثات من GitHub.

### 2. خطأ اتصال Socket.IO
**المشكلة**: التطبيق لا يتصل بالخادم
**الحل**: 
- تأكد من أن `NEXT_PUBLIC_SOCKET_SERVER_URL` يحتوي على الرابط الصحيح لخادم Render
- تأكد من أن خادم Render يعمل بشكل صحيح

### 3. خطأ قاعدة البيانات
**المشكلة**: `MongoDB connection failed`
**الحل**:
- تأكد من أن `MONGODB_URI` صحيح
- تأكد من أن عنوان IP مسموح به في MongoDB Atlas

### 4. نفاد الذاكرة أثناء البناء على Vercel
**المشكلة**: `JavaScript heap out of memory`
**الحل**: Vercel عادةً يتعامل مع هذا تلقائياً. إذا استمرت المشكلة:
- تأكد من أن `node_modules` غير مضمنة في Git
- احذف `.next` قبل النشر

---

## 📝 ملاحظات مهمة

1. **أولوية النشر**: 
   - ابدأ بنشر خادم Socket.IO على Render أولاً
   - ثم انشر التطبيق على Vercel مع استخدام رابط Render

2. **الأمان**:
   - لا تشارك متغيرات البيئة مع أحد
   - غيّر `secretKey` إلى قيمة فريدة وآمنة

3. **التحديثات**:
   - عند إجراء تحديثات على الكود، سيتم النشر تلقائياً
   - Render و Vercel يدعمان النشر التلقائي من GitHub

4. **التكلفة**:
   - Render: خطة مجانية متاحة (قد يكون هناك وقت توقف بعد 15 دقيقة من عدم النشاط)
   - Vercel: خطة مجانية متاحة مع حدود استخدام معقولة

---

## 🎉 بعد النشر

بعد نشر كلا الجزأين بنجاح:

1. افتح رابط Vercel في المتصفح
2. قم بإنشاء حساب جديد أو تسجيل الدخول
3. جرّب إرسال رسالة للتأكد من عمل Socket.IO بشكل صحيح
4. إذا واجهت مشاكل، تحقق من Logs في Render و Vercel

---

## 🆘 الحصول على المساعدة

إذا واجهت أي مشاكل:
1. تحقق من Logs في Render Dashboard
2. تحقق من Logs في Vercel Dashboard
3. تأكد من أن جميع متغيرات البيئة مضبوطة بشكل صحيح
4. تأكد من أن خادم Render يعمل (قد يتوقف في الخطة المجانية بعد فترة عدم نشاط)

---

تم التحديث: أكتوبر 2025
