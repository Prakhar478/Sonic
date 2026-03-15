'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Music, Loader2, Eye, EyeOff, X } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithEmail, signInWithGoogle } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }

    setIsLoading(true)
    const result = await signInWithEmail(email, password)
    setIsLoading(false)

    if (result.error) {
      if (result.error.includes('Invalid login credentials')) {
        setError('Wrong email or password. Try again.')
      } else if (result.error.includes('Email not confirmed')) {
        setError('Please verify your email first. Check your inbox.')
      } else {
        setError(result.error)
      }
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-[#0d0d0d] rounded-[24px] p-8 border border-[rgba(255,255,255,0.08)] relative shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] flex items-center justify-center transition-all duration-200 text-[#a1a1aa] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo Mark */}
        <div className="flex justify-center mb-8 pt-2">
          <div className="w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center shadow-lg transition-all duration-200">
            <Music className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-[28px] font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-[#a1a1aa] font-medium text-sm">Sign in to continue to Sonic</p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full h-[48px] rounded-xl bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center gap-3 text-white font-medium text-[15px] hover:bg-[#222222] hover:border-[#2563eb] transition-all duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          <span className="text-[12px] text-[#52525b]">or</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[48px] px-4 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#2563eb] transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-white block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[48px] pl-4 pr-12 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#2563eb] transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <a href="/forgot-password"
               className="text-[12px] text-[#2563eb] hover:underline self-end -mt-1 mb-2 pt-1 inline-block">
               Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] mt-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold flex items-center justify-center transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
             ) : 'Log in'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm font-medium text-[#a1a1aa]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#2563eb] hover:underline transition-colors duration-200">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
