'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Music, Eye, EyeOff, X, Check, Loader2 } from 'lucide-react'

const validatePassword = (pass: string) => [
  {
    id: 'length',
    label: 'At least 6 characters',
    valid: pass.length >= 6,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    valid: /[A-Z]/.test(pass),
  },
  {
    id: 'number',
    label: 'One number',
    valid: /[0-9]/.test(pass),
  },
]

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const allRulesPass = password 
    ? validatePassword(password).every(r => r.valid)
    : false

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const handleClose = () => {
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!allRulesPass) {
      setError('Please meet all password requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: password,
    })
    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setIsSuccess(true)
    setTimeout(() => {
      router.push('/')
    }, 2000)
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

        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-4 pt-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-[22px] font-bold text-white mb-2">
              Password updated!
            </h2>
            
            <p className="text-[14px] text-[#a1a1aa] mb-6">
              Your password has been changed successfully.
            </p>

            <p className="text-[13px] font-medium text-[#52525b] animate-pulse">
              Redirecting to app...
            </p>
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
              <h1 className="text-[28px] font-bold text-white tracking-tight">Set new password</h1>
              <p className="text-[#a1a1aa] font-medium text-sm">Choose a strong password for your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white block">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[48px] pl-4 pr-12 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#2563eb] transition-all duration-200"
                    placeholder="Create a password"
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
                
                {password && (
                  <div className="space-y-1.5 mt-2 mb-4">
                    {validatePassword(password).map(rule => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${rule.valid ? "bg-green-500" : "bg-[#333333]"}`}>
                          {rule.valid && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={`text-[12px] ${rule.valid ? "text-green-400" : "text-[#a1a1aa]"}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white block">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-[48px] pl-4 pr-12 rounded-xl bg-[#141414] border ${confirmPassword && !passwordsMatch ? 'border-red-500 focus:border-red-500' : 'border-[rgba(255,255,255,0.08)] focus:border-[#2563eb]'} text-white placeholder:text-[#52525b] focus:outline-none transition-all duration-200`}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-400 text-[12px] mt-1 pl-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!allRulesPass || !passwordsMatch || isLoading}
                className={`w-full h-[48px] rounded-xl font-semibold transition-all duration-200 mt-6 ${allRulesPass && passwordsMatch && !isLoading ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white cursor-pointer" : "bg-[#1a1a1a] text-[#52525b] cursor-not-allowed opacity-60 flex justify-center items-center"}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
