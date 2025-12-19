# Backend Login dengan Supabase - ShopRecord

## 📋 Struktur File yang Dibuat

```
shoprecord/
├── .env.local                          # Environment variables
├── middleware.ts                       # Route protection middleware
├── lib/
│   ├── auth.ts                        # Auth utility functions
│   └── supabase/
│       ├── client.ts                  # Browser client
│       ├── server.ts                  # Server client
│       └── middleware.ts              # Session management
├── app/
│   ├── page.tsx                       # Home page with integrated login/signup
│   └── api/
│       └── auth/
│           ├── login/route.ts         # Login endpoint
│           ├── signup/route.ts        # Signup endpoint
│           └── logout/route.ts        # Logout endpoint
```

## 🚀 Cara Setup

### 1. Konfigurasi Environment Variables

Edit file `.env.local` dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Cara mendapatkan kredensial:**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik Settings > API
4. Copy URL dan anon/public key

### 2. Setup Authentication di Supabase

1. Buka Supabase Dashboard > Authentication
2. Pastikan Email Provider sudah enabled
3. (Opsional) Nonaktifkan email confirmation untuk development:
   - Settings > Authentication > Email Auth
   - Uncheck "Enable email confirmations"

### 3. Jalankan Development Server

```bash
npm run dev
```

## 🔐 API Endpoints

### POST `/api/auth/login`
Login dengan email dan password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Login berhasil",
  "user": {...},
  "session": {...}
}
```

### POST `/api/auth/signup`
Registrasi user baru.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response (Success):**
```json
{
  "message": "Registrasi berhasil. Silakan cek email untuk verifikasi.",
  "user": {...}
}
```

### POST `/api/auth/logout`
Logout user.

**Response (Success):**
```json
{
  "message": "Logout berhasil"
}
```

## 📱 Halaman yang Tersedia

- `/` - Halaman utama dengan form login/signup terintegrasi

## 🛡️ Proteksi Route

Middleware secara otomatis melindungi semua route kecuali:
- `/` (home page dengan form auth)
- `/auth/*` (callback routes)
- Static files

User yang belum login akan otomatis diarahkan ke `/` (home page).

## 🔧 Fungsi Utility

### `getUser()`
Mendapatkan user yang sedang login (server-side).

```typescript
import { getUser } from '@/lib/auth'

const user = await getUser()
```

### `getSession()`
Mendapatkan session yang aktif (server-side).

```typescript
import { getSession } from '@/lib/auth'

const session = await getSession()
```

### `createClient()` (Client-side)
Membuat Supabase client untuk browser.

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### `createClient()` (Server-side)
Membuat Supabase client untuk server components/API routes.

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

## 📝 Contoh Penggunaan

### Di Server Component
```typescript
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/')
  }
  
  return <div>Welcome, {user.email}!</div>
}
```

### Di Client Component
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Profile() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])
  
  return <div>{user?.email}</div>
}
```

## ⚠️ Catatan Penting

1. **Jangan commit file `.env.local`** - File ini sudah ada di `.gitignore`
2. **Password minimum 6 karakter** - Requirement dari Supabase
3. **Email verification** - Secara default Supabase mengirim email verifikasi. Nonaktifkan untuk development.
4. **Session management** - Session otomatis di-refresh oleh middleware
5. **Cookie-based auth** - Menggunakan cookies untuk menyimpan session

## 🔄 Next Steps

1. Tambahkan fitur forgot password
2. Implementasi OAuth providers (Google, GitHub, dll)
3. Tambahkan user profile management
4. Setup role-based access control
5. Implementasi email verification handling

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 15 with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
