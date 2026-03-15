'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function VerifiedPage() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(timer)
        }
        return next
      })
    }, 1000)

    const redirect = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push('/')
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [router])

  const handleClick = () => {
    if (!hasRedirected.current) {
      hasRedirected.current = true
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="relative max-w-[420px] w-full text-center">

        <button
          onClick={handleClick}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] flex items-center justify-center transition-all duration-200 text-[#a1a1aa] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <img 
          src="/images/logo.jpeg"
          alt="Sonic"
          className="w-10 h-10 rounded-xl object-contain mx-auto mb-4"
        />

        <h1 className="text-[28px] font-bold text-white mb-3">
          Email Verified!
        </h1>
        
        <p className="text-[15px] text-[#a1a1aa] mb-2">
          Your Sonic account is now active.
        </p>
        
        <p className="text-[14px] text-[#52525b] mb-8">
          You are now signed in and ready to start listening.
        </p>

        <button
          onClick={handleClick}
          className="w-full h-[52px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[16px] rounded-xl transition-all duration-200 hover:scale-[1.02] mb-4">
          Start Listening →
        </button>

        <p className="text-[12px] text-[#52525b]">
          {countdown > 0 
            ? `Redirecting in ${countdown}s`
            : 'Redirecting...'}
        </p>

      </div>
    </div>
  )
}
