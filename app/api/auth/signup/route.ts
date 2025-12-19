import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })

    if (error) {
      console.error('Supabase signup error:', error)
      
      // Handle specific error codes
      if (error.message.includes('invalid')) {
        return NextResponse.json(
          { 
            error: 'Tidak dapat mendaftar. Pastikan Email Confirmation dinonaktifkan di Supabase Dashboard (Authentication → Settings → Email Auth → Disable "Confirm email")' 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
      user: data.user,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
