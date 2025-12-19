import { createClient } from '@/lib/supabase/server'

export async function getUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return null
    }
    
    return user
  } catch {
    return null
  }
}

export async function getSession() {
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return null
    }
    
    return session
  } catch {
    return null
  }
}
