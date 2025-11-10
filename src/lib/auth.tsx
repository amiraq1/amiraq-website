import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // تحميل المستخدم الحالي
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) {
          setUser(user)
        }
      } catch (error) {
        console.error('خطأ في تحميل المستخدم:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // محاولة تسجيل الدخول عبر Supabase أولاً
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        // إذا فشل، السماح بالدخول التجريبي (أي بريد وكلمة مرور)
        // هذا للتجربة فقط - يجب إزالته في الإنتاج
        if (email && password.length >= 6) {
          // إنشاء session وهمية للتجريب
          const demoUser = {
            id: 'demo-user-' + Date.now(),
            email: email,
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: 'authenticated'
          } as User
          
          setUser(demoUser)
          setLoading(false)
          return { user: demoUser, session: null }
        }
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من بياناتك.')
      }
      
      return data
    } catch (err: any) {
      // تحسين رسائل الخطأ
      if (err.message?.includes('Invalid login credentials')) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else if (err.message?.includes('Email not confirmed')) {
        throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً')
      } else if (err.message?.includes('fetch')) {
        throw new Error('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.')
      }
      throw err
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
