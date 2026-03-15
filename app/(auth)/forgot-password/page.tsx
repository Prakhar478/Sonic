'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Music, Loader2, Mail, X } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleClose = () => {
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setEmailSent(true)
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

        {emailSent ? (
          <div className="flex flex-col items-center text-center py-4 pt-8">
            <div className="w-16 h-16 rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#2563eb]" />
            </div>

            <h2 className="text-[22px] font-bold text-white mb-2">
              Check your email
            </h2>
            
            <p className="text-[14px] text-[#a1a1aa] mb-1">
              We sent a password reset link to
            </p>
            
            <p className="text-[15px] font-semibold text-white mb-6">
              {email}
            </p>
            
            <p className="text-[13px] text-[#52525b] mb-6 leading-relaxed">
              Click the link to reset your password. Link expires in 1 hour.
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full h-[48px] rounded-xl bg-[#1a1a1a] hover:bg-[#222222] text-white font-semibold transition-all duration-200 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
              >
                Try a different email
              </button>
              
              <Link
                href="/login"
                className="text-[13px] text-[#a1a1aa] hover:text-white hover:underline transition-colors mt-2"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Logo Mark */}
            <div className="flex justify-center mb-8 pt-2">
              <div className="w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center shadow-lg transition-all duration-200">
                <Music className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-[28px] font-bold text-white tracking-tight">Reset password</h1>
              <p className="text-[#a1a1aa] font-medium text-sm leading-relaxed max-w-[90%] mx-auto">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] px-4 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#2563eb] transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold flex items-center justify-center transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                 ) : 'Send reset link'}
              </button>
            </form>

            <div className="mt-8 text-center text-[13px] font-medium text-[#a1a1aa]">
              Remember your password?{' '}
              <Link href="/login" className="text-[#2563eb] hover:underline transition-colors duration-200">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
