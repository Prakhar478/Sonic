import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_premium: boolean
}

interface AuthStore {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (
    email: string, 
    password: string
  ) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      set({ 
        user: session.user,
        isAuthenticated: true 
      })
      await get().fetchProfile(session.user.id)
    }
    set({ isLoading: false })

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ 
          user: session.user,
          isAuthenticated: true 
        })
        await get().fetchProfile(session.user.id)
      } else {
        set({ 
          user: null, 
          profile: null,
          isAuthenticated: false 
        })
      }
    })
  },

  signInWithGoogle: async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  signInWithEmail: async (email, password) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  signUpWithEmail: async (email, password, fullName) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ 
      user: null, 
      profile: null, 
      isAuthenticated: false 
    })
    window.location.href = '/'
  },

  fetchProfile: async (userId) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ profile: data })
  },
}))
